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

// -----------------------------------------------------------------------------
// Runtime bindings supplied by Cloudflare Pages (Settings → Variables & secrets)
// -----------------------------------------------------------------------------
interface Env {
  GROQ_API_KEY: string; // Encrypted secret. Server-side only.
  GROQ_MODEL?: string; // Plaintext var. Falls back to DEFAULT_MODEL below.
}

// Chosen because it is on Groq's current *Production* model list (verified at
// console.groq.com/docs/models), follows long instruction sets faithfully, and
// streams fast enough to feel instant. Override per-environment via GROQ_MODEL.
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// -----------------------------------------------------------------------------
// Guardrails
// -----------------------------------------------------------------------------
const MAX_INPUT_CHARS = 1200; // Per-message input cap
const MAX_HISTORY_TURNS = 8; // Conversation turns retained for context
const RATE_LIMIT_MAX = 20; // Messages allowed per window, per IP
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// -----------------------------------------------------------------------------
// Best-effort in-memory IP rate limiter.
// NOTE: module scope lives as long as the isolate, so this is per-isolate rather
// than globally consistent. It reliably stops a single abusive client hammering
// the endpoint, which is the threat here. If this ever needs to be strict
// across all edge locations, swap the Map for a KV namespace or Durable Object —
// the read/increment shape below is deliberately easy to port.
// -----------------------------------------------------------------------------
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  // Drop timestamps that have aged out of the window.
  const recent = (hits.get(ip) ?? []).filter((t) => t > cutoff);

  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the Map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => t <= cutoff)) hits.delete(key);
    }
  }

  return false;
}

// -----------------------------------------------------------------------------
// Same-origin check. Compares the Referer/Origin host against the host actually
// serving the request, so this works unchanged on localhost, *.pages.dev preview
// URLs, and the production domain without a hardcoded allowlist.
// -----------------------------------------------------------------------------
function isSameOrigin(request: Request): boolean {
  const selfHost = new URL(request.url).host;
  const candidate = request.headers.get("Origin") ?? request.headers.get("Referer");

  if (!candidate) return false;

  try {
    return new URL(candidate).host === selfHost;
  } catch {
    return false;
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

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

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (isRateLimited(ip)) {
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

  let upstream: Response;
  try {
    upstream = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL || DEFAULT_MODEL,
        temperature: 0.3,
        max_tokens: 700,
        stream: true,
        messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
      }),
    });
  } catch {
    return json({ error: "Could not reach the model provider." }, 502);
  }

  if (!upstream.ok || !upstream.body) {
    // Log the provider's reason server-side; never forward it to the client,
    // since provider errors can echo request details.
    console.error("Groq request failed", upstream.status, await upstream.text().catch(() => ""));
    return json({ error: "The assistant is temporarily unavailable." }, 502);
  }

  return new Response(toTextStream(upstream.body), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
