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
// SECURITY: This file is the ONLY place the Groq API key is read. It is bound at
//          runtime as an encrypted secret (env.GROQ_API_KEY) and is never
//          imported by, inlined into, or exposed to client code. There is no
//          NEXT_PUBLIC_ equivalent and there must never be one.
// =============================================================================

import { buildSystemPrompt } from "../../content/knowledge";
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
  GROQ_API_KEY: string; // Encrypted secret. Server-side only.
  GROQ_MODEL?: string; // Optional plaintext override; see modelCandidates below.
  RATE_LIMIT?: KVNamespace; // KV namespace backing the IP rate limiter.
}

// -----------------------------------------------------------------------------
// Model selection, in preference order.
//
// WHY A CHAIN AND NOT A SINGLE ID: this site went dark once already because it
// pinned `llama-3.3-70b-versatile`, which Groq shut down on 2026-08-16. Every
// request then failed with a 404 and the assistant showed "Something went wrong"
// to every visitor. A hardcoded single model makes a provider deprecation an
// outage, and deprecations are routine and pre-announced by email that nobody
// reads. So we carry an ordered list and fall through it.
//
// Only *model availability* failures advance the chain (see isModelUnavailable).
// Rate limits, auth failures and outages must NOT, because retrying those on a
// different model would multiply load and mask the real problem.
//
// All three are on Groq's Production list, and the latter two are Groq's own
// documented replacements for the model this site used to run.
// -----------------------------------------------------------------------------
const MODEL_CHAIN = [
  "openai/gpt-oss-120b", // Groq's recommended replacement for llama-3.3-70b.
  "qwen/qwen3.6-27b", // Second recommended replacement; different family.
  "openai/gpt-oss-20b", // Smallest/cheapest, last resort so we degrade rather than fail.
] as const;

// Models known to be retired. GROQ_MODEL is operator-supplied and lives in the
// Cloudflare dashboard, where it is easy to set once and forget for a year, so a
// stale value there must not be able to break the site.
const RETIRED_MODELS = new Set([
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3-32b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
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
    haystack.includes("model_not_found") ||
    haystack.includes("model_decommissioned") ||
    haystack.includes("does not exist") ||
    haystack.includes("has been decommissioned") ||
    haystack.includes("no longer supported")
  );
}

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

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

  // Keep only the most recent turns (a turn being a user/assistant pair).
  return cleaned.slice(-(MAX_HISTORY_TURNS * 2));
}

// -----------------------------------------------------------------------------
// Translates Groq's SSE stream into a plain UTF-8 text stream of content deltas,
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
            if (payload === "" || payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
              };
              const token = parsed.choices?.[0]?.delta?.content;
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

  if (!env.GROQ_API_KEY) {
    // Misconfiguration, not a user error — surface it distinctly in logs.
    console.error("GROQ_API_KEY is not bound to this environment.");
    return json({ error: "Assistant is not configured." }, 503);
  }

  const systemPrompt = buildSystemPrompt();
  const candidates = modelCandidates(env.GROQ_MODEL);

  // Walk the candidate models. The body is only read on the failure path, so an
  // unconsumed successful response can still be streamed straight through.
  for (let i = 0; i < candidates.length; i++) {
    const model = candidates[i];
    const isLast = i === candidates.length - 1;

    let upstream: Response;
    try {
      upstream = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 700,
          stream: true,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
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
    console.error(`Groq request failed (model=${model})`, upstream.status, detail);

    // The provider throttling us is a distinct, recoverable condition. Masking
    // it as a generic 502 told users "something went wrong" when the honest
    // answer is "we are busy, try again shortly".
    if (upstream.status === 429) {
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
