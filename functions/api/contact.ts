// =============================================================================
// FILE: functions/api/contact.ts
// PURPOSE: Cloudflare Pages Function backing the website contact form.
//          Served at POST /api/contact alongside the statically exported site.
//
// WHY A PAGES FUNCTION AND NOT A NEXT ROUTE HANDLER:
//          next.config.ts sets `output: "export"`, which produces a purely
//          static site with no Node.js server, so Route Handlers that rely on
//          Request are unsupported. The server-side hop lives here instead, on
//          the Cloudflare Workers runtime that already serves this site.
//
// WHY IT DELEGATES THE ACTUAL SEND:
//          Cloudflare Email Service is only reachable through a `send_email`
//          binding, and Pages Functions cannot hold one. So this function owns
//          everything *except* the send — origin check, rate limit, spam
//          filtering, validation — and hands the clean submission to the private
//          Worker in workers/email over the EMAIL_SERVICE service binding.
//
// DEGRADATION: if EMAIL_SERVICE is not bound (e.g. a preview deployment created
//          before the binding was added), this returns 503 `not_configured`
//          rather than a generic failure. The form treats that specific code as
//          a signal to fall back to a mailto: link, so a visitor is never left
//          with no way to make contact.
// =============================================================================

import {
  clientIp,
  isRateLimited,
  isSameOrigin,
  json,
  type KVNamespace,
} from "../../server/edge";

// Service bindings expose a fetch() that speaks directly to the bound Worker
// without leaving Cloudflare's network. Declared locally so the Functions build
// does not need @cloudflare/workers-types.
interface Fetcher {
  fetch(input: string, init?: RequestInit): Promise<Response>;
}

interface Env {
  EMAIL_SERVICE?: Fetcher; // Service binding → the 1n599-email Worker.
  RATE_LIMIT?: KVNamespace; // Shared KV namespace backing the IP rate limiter.
}

// -----------------------------------------------------------------------------
// Guardrails
//
// The limit is deliberately far tighter than the assistant's. A human with
// something to say sends one message, maybe two if they mistyped their address.
// Anything past five in an hour from one address is a script, and every one of
// these costs a real email delivery against the account's sending quota.
// -----------------------------------------------------------------------------
const MAX_NAME = 120;
const MAX_EMAIL = 254; // RFC 5321 maximum length of a forward-path.
const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 10; // Below this it is a test or a mash of the keyboard.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface Submission {
  name: string;
  email: string;
  message: string;
}

// Deliberately permissive: one @, no whitespace, a dot in the domain. Strict
// RFC 5322 validation is famously unreliable and rejects addresses that work,
// and the real proof of validity is whether the reply lands.
function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value) && value.length <= MAX_EMAIL;
}

// A distinct result type so the caller can tell "the visitor made a mistake"
// (worth an explanatory message) from "this was a bot" (worth silence).
type ParseResult =
  | { ok: true; value: Submission }
  | { ok: false; reason: "invalid" | "spam" };

function parseSubmission(input: unknown): ParseResult {
  if (typeof input !== "object" || input === null) return { ok: false, reason: "invalid" };

  const { name, email, message, company } = input as Record<string, unknown>;

  // `company` is a honeypot: hidden from real users by CSS and left blank by
  // them, but eagerly filled by form-stuffing bots that autofill every input.
  // Anything in it means we are not talking to a person.
  if (typeof company === "string" && company.trim() !== "") {
    return { ok: false, reason: "spam" };
  }

  if (typeof email !== "string" || typeof message !== "string") {
    return { ok: false, reason: "invalid" };
  }

  const cleanEmail = email.trim().slice(0, MAX_EMAIL);
  const cleanMessage = message.trim().slice(0, MAX_MESSAGE);
  const cleanName = (typeof name === "string" ? name : "").trim().slice(0, MAX_NAME);

  if (!isPlausibleEmail(cleanEmail)) return { ok: false, reason: "invalid" };
  if (cleanMessage.length < MIN_MESSAGE) return { ok: false, reason: "invalid" };

  return { ok: true, value: { name: cleanName, email: cleanEmail, message: cleanMessage } };
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (!isSameOrigin(request)) {
    return json({ error: "forbidden" }, 403);
  }

  const limited = await isRateLimited(clientIp(request), env.RATE_LIMIT, {
    bucket: "contact",
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (limited) {
    return json({ error: "rate_limited" }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const parsed = parseSubmission(body);

  if (!parsed.ok) {
    // Honeypot hits get a 200. Telling a bot it failed invites it to adapt,
    // and there is no human on the other end to inform.
    if (parsed.reason === "spam") return json({ ok: true }, 200);
    return json({ error: "invalid_submission" }, 400);
  }

  if (!env.EMAIL_SERVICE) {
    // Misconfiguration, not a user error — surface it distinctly in logs, and
    // distinctly to the client so the form can offer the mailto: fallback.
    console.error("EMAIL_SERVICE binding is not bound to this environment.");
    return json({ error: "not_configured" }, 503);
  }

  let upstream: Response;
  try {
    // The hostname is ignored for service bindings — the request is routed to
    // the bound Worker directly — but fetch() still requires a valid absolute
    // URL, so this is a placeholder rather than a real address.
    upstream = await env.EMAIL_SERVICE.fetch("https://email.internal/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.value),
    });
  } catch (err) {
    console.error("EMAIL_SERVICE fetch threw:", err);
    return json({ error: "send_failed" }, 502);
  }

  if (!upstream.ok) {
    // Logged, never forwarded: provider errors can echo internal configuration.
    const detail = await upstream.text().catch(() => "");
    console.error("Email worker rejected the send", upstream.status, detail);
    return json({ error: "send_failed" }, 502);
  }

  return json({ ok: true }, 200);
};
