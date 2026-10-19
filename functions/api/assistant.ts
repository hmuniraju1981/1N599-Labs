// =============================================================================
// FILE: functions/api/assistant.ts
// PURPOSE: Cloudflare Pages Function backing the website AI assistant.
//          Served at POST /api/assistant alongside the statically exported site.
//
// WHY A PAGES FUNCTION AND NOT A NEXT ROUTE HANDLER:
//          next.config.ts sets `output: "export"`, which produces a purely
//          static site with no Node.js server. The Next.js docs list
//          "Route Handlers that rely on Request" as unsupported under static
//          export, so the server-side hop lives here instead, on the Cloudflare
//          Workers runtime that already serves this site.
//
// SECURITY: This file is the ONLY place the Anthropic API key is read. It is
//          bound at runtime as an encrypted secret (env.ANTHROPIC_API_KEY) and is never
//          imported by, inlined into, or exposed to client code. There is no
//          NEXT_PUBLIC_ equivalent and there must never be one.
// =============================================================================

import { buildSystemPrompt, findProduct } from "../../content/knowledge";
import {
  clientIp,
  isRateLimited,
  isSameOrigin,
  json,
  type KVNamespace,
} from "../../server/edge";

// -----------------------------------------------------------------------------
// Runtime bindings supplied by Cloudflare Pages (Settings → Variables & secrets)
// -----------------------------------------------------------------------------
interface Env {
  ANTHROPIC_API_KEY: string; // Encrypted secret. Server-side only.
  ANTHROPIC_MODEL?: string; // Optional plaintext override; see modelCandidates below.
  RATE_LIMIT?: KVNamespace; // KV namespace backing the IP rate limiter.
}

// -----------------------------------------------------------------------------
// Model selection, in preference order.
//
// WHY A CHAIN AND NOT A SINGLE ID: this site went dark once already because it
// pinned a single model that its provider (then Groq) shut down; every request
// failed and the assistant showed "Something went wrong" to every visitor. A
// hardcoded single model makes a provider deprecation an outage, so we carry an
// ordered list and fall through it.
//
// Only *model availability* failures advance the chain (see isModelUnavailable).
// Rate limits, auth failures and outages must NOT, because retrying those on a
// different model would multiply load and mask the real problem.
//
// IDs from https://platform.claude.com/docs/en/about-claude/models/overview.
// -----------------------------------------------------------------------------
const MODEL_CHAIN = [
  "claude-haiku-5-5", // Fastest and cheapest; plenty for a scoped product FAQ.
  "claude-sonnet-5-5", // Fallback if Haiku is unavailable to this key.
] as const;

// Models known to be retired, or IDs from the previous provider. The model
// override lives in the Cloudflare dashboard, where it is easy to set once and
// forget for a year, so a stale value there must not be able to break the site.
const RETIRED_MODELS = new Set([
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "llama-3.3-70b-versatile",
]);

// Builds the ordered candidate list: the operator's override first (when it is
// not a known-retired ID), then the built-in chain, de-duplicated.
function modelCandidates(override?: string): string[] {
  const preferred = override?.trim();
  const ordered = preferred && !RETIRED_MODELS.has(preferred)
    ? [preferred, ...MODEL_CHAIN]
    : [...MODEL_CHAIN];

  return [...new Set(ordered)];
}

// True when the provider is telling us this specific model cannot serve the
// request — retired, renamed, or not enabled for this key. Anything else is a
// real error and should surface as-is.
function isModelUnavailable(status: number, body: string): boolean {
  if (status !== 400 && status !== 404) return false;

  const haystack = body.toLowerCase();
  return (
    haystack.includes("not_found_error") ||
    haystack.includes("model_not_found") ||
    haystack.includes("does not exist") ||
    haystack.includes("deprecated") ||
    haystack.includes("no longer supported")
  );
}

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

// -----------------------------------------------------------------------------
// Guardrails
// -----------------------------------------------------------------------------
const MAX_INPUT_CHARS = 1200; // Per-message input cap
const MAX_HISTORY_TURNS = 8; // Conversation turns retained for context
const RATE_LIMIT_MAX = 20; // Messages allowed per window, per IP
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function parseMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;

  const cleaned: ChatMessage[] = [];

  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) return null;

    const { role, content } = raw as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;

    const trimmed = content.trim();
    if (trimmed.length === 0) continue;

    cleaned.push({ role, content: trimmed.slice(0, MAX_INPUT_CHARS) });
  }

  if (cleaned.length === 0) return null;
  if (cleaned[cleaned.length - 1].role !== "user") return null;

  // Keep only the most recent turns (a turn being a user/assistant pair). The
  // Messages API requires the conversation to open with a user turn.
  const recent = cleaned.slice(-(MAX_HISTORY_TURNS * 2));
  while (recent.length > 0 && recent[0].role !== "user") recent.shift();
  return recent;
}

// -----------------------------------------------------------------------------
// Translates Anthropic's SSE stream into a plain UTF-8 text stream of content deltas,
// so the browser can append tokens directly without parsing SSE itself.
// -----------------------------------------------------------------------------
function toTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE frames are newline-delimited; keep any partial trailing line.
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const payload = trimmed.slice(5).trim();
            if (payload === "") continue;

            try {
              const parsed = JSON.parse(payload) as {
                type?: string;
                delta?: { type?: string; text?: string };
                error?: { type?: string };
              };
              if (parsed.type === "error") {
                console.error("Anthropic stream error", parsed.error?.type);
                continue;
              }
              if (parsed.type !== "content_block_delta") continue;
              if (parsed.delta?.type !== "text_delta") continue;
              const token = parsed.delta.text;
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              // A malformed frame should not kill an otherwise good stream.
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (!isSameOrigin(request)) {
    return json({ error: "Forbidden." }, 403);
  }

  const limited = await isRateLimited(clientIp(request), env.RATE_LIMIT, {
    bucket: "assistant",
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (limited) {
    return json({ error: "rate_limited" }, 429);
  }

  // Validate the request before checking server config, so a malformed payload
  // always reports as a client error rather than being masked by a 503.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const messages = parseMessages((body as { messages?: unknown })?.messages);
  if (!messages) {
    return json({ error: "Invalid messages payload." }, 400);
  }

  if (!env.ANTHROPIC_API_KEY) {
    // Misconfiguration, not a user error — surface it distinctly in logs.
    console.error("ANTHROPIC_API_KEY is not bound to this environment.");
    return json({ error: "Assistant is not configured." }, 503);
  }

  // Optional product focus from the side panel. Only a known product id is
  // honoured; anything else is ignored rather than echoed into the prompt.
  const focus = findProduct((body as { product?: unknown })?.product);
  const systemPrompt = buildSystemPrompt(focus);
  const candidates = modelCandidates(env.ANTHROPIC_MODEL);

  // Walk the candidate models. The body is only read on the failure path, so an
  // unconsumed successful response can still be streamed straight through.
  for (let i = 0; i < candidates.length; i++) {
    const model = candidates[i];
    const isLast = i === candidates.length - 1;

    let upstream: Response;
    try {
      upstream = await fetch(ANTHROPIC_ENDPOINT, {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": ANTHROPIC_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 700,
          stream: true,
          system: systemPrompt,
          messages,
        }),
      });
    } catch {
      return json({ error: "Could not reach the model provider." }, 502);
    }

    if (upstream.ok && upstream.body) {
      return new Response(toTextStream(upstream.body), {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          // Which model actually answered. Purely diagnostic, but it turns
          // "the bot is weird today" into a one-request investigation.
          "X-Model": model,
        },
      });
    }

    // Log the provider's reason server-side; never forward it to the client,
    // since provider errors can echo request details.
    const detail = await upstream.text().catch(() => "");
    console.error(`Anthropic request failed (model=${model})`, upstream.status, detail);

    // The provider throttling us is a distinct, recoverable condition. Masking
    // it as a generic 502 told users "something went wrong" when the honest
    // answer is "we are busy, try again shortly".
    // 529 is Anthropic's "overloaded" status.
    if (upstream.status === 429 || upstream.status === 529) {
      return json({ error: "upstream_busy" }, 429);
    }

    // This model is gone or unavailable to us — try the next one. Anything else
    // (401, 403, 5xx) is not fixable by switching models, so stop immediately.
    if (!isModelUnavailable(upstream.status, detail) || isLast) {
      return json({ error: "The assistant is temporarily unavailable." }, 502);
    }

    console.warn(`Model ${model} unavailable; falling back to ${candidates[i + 1]}.`);
  }

  // Unreachable: the loop always returns. Present so the function is total.
  return json({ error: "The assistant is temporarily unavailable." }, 502);
};
