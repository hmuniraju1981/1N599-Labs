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
  RATE_LIMIT?: KVNamespace; // KV namespace backing the IP rate limiter.
}

// Minimal shape of the KV binding we rely on, declared locally so this file
// does not need the full @cloudflare/workers-types package.
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
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
// KV-backed IP rate limiter.
//
// WHY KV AND NOT MODULE STATE: an in-memory Map only lives as long as one V8
// isolate. Locally that is a single long-lived isolate so a Map appears to work,
// but on the real edge requests are spread across isolates that are constantly
// created and recycled, so counts never accumulate and the limit never trips.
// This was measured: 22 consecutive edge requests produced zero 429s, where the
// same test locally tripped on request 21 exactly. KV is shared across isolates.
//
// KV is eventually consistent, on the order of seconds. Against a 600-second
// window that is comfortably accurate enough for abuse control.
//
// FAILURE MODE: fails OPEN. If KV is unavailable the assistant keeps answering
// rather than going dark, and a Cloudflare WAF rate-limiting rule on this route
// is the backstop that protects API spend. A KV blip should not break the site.
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Collapses a client address to the unit we want to rate limit.
//
// IPv4 is used as-is. IPv6 is truncated to its /64 prefix, because a single
// client is routinely allocated a whole /64 (or larger). Keying on the full
// address would let anyone increment one hextet to mint a fresh quota, making
// the limit meaningless — the logs confirmed Cloudflare hands us full IPv6
// addresses, e.g. 2603:8082:af00:3cf:d918:e843:7b7d:9001.
//
// Consequence, and it is intended: everyone behind one /64 (typically one
// household) shares a single quota.
// -----------------------------------------------------------------------------
export function rateLimitKey(ip: string): string {
  if (!ip.includes(":")) return ip; // IPv4, or the "unknown" fallback.

  // IPv4-mapped IPv6 (::ffff:203.0.113.5) — limit on the embedded IPv4.
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];

  // Expand "::" so the prefix is taken from the true hextet positions.
  let groups: string[];
  if (ip.includes("::")) {
    const [head, tail] = ip.split("::");
    const headParts = head ? head.split(":") : [];
    const tailParts = tail ? tail.split(":") : [];
    const gap = Math.max(0, 8 - headParts.length - tailParts.length);
    groups = [...headParts, ...Array(gap).fill("0"), ...tailParts];
  } else {
    groups = ip.split(":");
  }

  return groups
    .slice(0, 4)
    .map((h) => (h || "0").toLowerCase())
    .join(":");
}

async function isRateLimited(ip: string, store?: KVNamespace): Promise<boolean> {
  // No binding configured (e.g. local dev without --kv): skip, do not block.
  if (!store) return false;

  const key = `rl:${rateLimitKey(ip)}`;
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  try {
    const raw = await store.get(key);

    // Stored as a JSON array of epoch-ms timestamps.
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const timestamps = Array.isArray(parsed)
      ? parsed.filter((t): t is number => typeof t === "number" && t > cutoff)
      : [];

    if (timestamps.length >= RATE_LIMIT_MAX) return true;

    timestamps.push(now);

    // expirationTtl lets KV evict the key once the window has fully elapsed,
    // so the namespace self-cleans and needs no sweeping.
    await store.put(key, JSON.stringify(timestamps), {
      expirationTtl: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    });

    return false;
  } catch (err) {
    console.error("Rate limiter KV error, failing open:", err);
    return false;
  }
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

  // CF-Connecting-IP is set by Cloudflare itself on the edge and cannot be
  // spoofed by the client, so it is safe to key the limiter on.
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (await isRateLimited(ip, env.RATE_LIMIT)) {
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
    const detail = await upstream.text().catch(() => "");
    console.error("Groq request failed", upstream.status, detail);

    // The provider throttling us is a distinct, recoverable condition. Masking
    // it as a generic 502 told users "something went wrong" when the honest
    // answer is "we are busy, try again shortly".
    if (upstream.status === 429) {
      return json({ error: "upstream_busy" }, 429);
    }

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
