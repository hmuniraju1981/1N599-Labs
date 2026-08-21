// =============================================================================
// FILE: workers/email/src/index.ts
// PURPOSE: Private mail-transport Worker for the website contact form. Takes a
//          validated submission from the Pages Function and hands it to
//          Cloudflare Email Service via the `send_email` binding.
//
// TRUST MODEL: This Worker has no public route (see wrangler.jsonc), so its only
//          caller is our own Pages project over a service binding. It still
//          validates its input rather than trusting the caller — the cost is a
//          few lines and it means a bug on the Pages side cannot turn into a
//          malformed-send or a header-injection.
//
// WHY NOT A THIRD-PARTY MAIL API: Resend/SendGrid/Postmark would all work, but
//          each needs an API key to store and rotate, and a paid tier once the
//          free allowance runs out. Email Service is already part of this
//          account, needs no secret, and the domain is already verified for
//          sending, so it is strictly less to own and less to leak.
// =============================================================================

// -----------------------------------------------------------------------------
// The `send_email` binding surface we use, declared locally so this Worker does
// not need the full @cloudflare/workers-types package as a dependency.
// -----------------------------------------------------------------------------
interface EmailBinding {
  send(message: {
    to: string;
    from: string | { email: string; name?: string };
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string | { email: string; name?: string };
  }): Promise<{ messageId: string }>;
}

interface Env {
  EMAIL: EmailBinding;
}

// Where contact-form mail is delivered. This must stay in sync with the
// `allowed_destination_addresses` allowlist in wrangler.jsonc, and must be a
// verified destination address in Email Routing.
//
// NOTE: contact@1n599inc.ai already forwards here via an Email Routing rule, so
// mailing this address puts the message in exactly the same inbox a visitor
// would reach by writing to contact@ directly. We target the verified address
// rather than contact@ because Email Service only sends to verified
// destinations, and contact@ is a routing *source*, not a destination.
const CONTACT_TO = "harshamuniraju6@gmail.com";

// Sender must belong to a domain onboarded to Email Service. Verified working
// for this zone.
const CONTACT_FROM = { email: "contact@1n599inc.ai", name: "1N599 Inc Website" };

// Mirrors the caps enforced on the Pages side and in the browser.
const MAX_NAME = 120;
const MAX_EMAIL = 254; // RFC 5321 maximum length of a forward-path.
const MAX_MESSAGE = 4000;

interface Submission {
  name: string;
  email: string;
  message: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// -----------------------------------------------------------------------------
// Strips CR/LF and collapses whitespace. Applied to every value that lands in a
// mail *header* (subject, reply-to display name). Newlines in header values are
// the classic email header-injection vector: a submitted name of
// "bob\nBcc: victim@example.com" would otherwise forge a header.
// -----------------------------------------------------------------------------
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

// Escapes the five characters that matter in HTML so a submitted message cannot
// inject markup into the HTML part of the email we send ourselves.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Deliberately permissive: one @, no whitespace, a dot in the domain. Strict
// RFC 5322 validation is famously unreliable and rejects addresses that work,
// and the real proof of validity is whether the reply lands.
function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value) && value.length <= MAX_EMAIL;
}

function parseSubmission(input: unknown): Submission | null {
  if (typeof input !== "object" || input === null) return null;

  const { name, email, message } = input as Record<string, unknown>;

  if (typeof email !== "string" || typeof message !== "string") return null;

  const cleanEmail = email.trim().slice(0, MAX_EMAIL);
  const cleanMessage = message.trim().slice(0, MAX_MESSAGE);
  // Name is optional; fall back to a label rather than rejecting the message.
  const cleanName = headerSafe(typeof name === "string" ? name : "").slice(0, MAX_NAME);

  if (!isPlausibleEmail(cleanEmail)) return null;
  if (cleanMessage.length === 0) return null;

  return { name: cleanName || "Website visitor", email: cleanEmail, message: cleanMessage };
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const submission = parseSubmission(body);
    if (!submission) {
      return json({ error: "invalid_submission" }, 400);
    }

    const { name, email, message } = submission;

    // The subject carries the sender so the inbox is triageable at a glance.
    // headerSafe() has already removed anything that could break out of it.
    const subject = `[1N599 Website] Message from ${name}`;

    const text = [
      `From: ${name} <${email}>`,
      `Sent: ${new Date().toISOString()}`,
      "",
      message,
      "",
      "---",
      "Submitted via the contact form at https://1n599inc.ai/#contact",
      "Reply directly to this email to respond to the sender.",
    ].join("\n");

    const html = [
      '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.6;color:#111">',
      `<p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(name)} `,
      `&lt;<a href="mailto:${encodeURIComponent(email)}">${escapeHtml(email)}</a>&gt;</p>`,
      `<p style="margin:0 0 16px;color:#666"><strong>Sent:</strong> ${escapeHtml(new Date().toISOString())}</p>`,
      // white-space:pre-wrap preserves the visitor's line breaks without us
      // having to convert them to <br>, which would need its own escaping pass.
      '<div style="white-space:pre-wrap;padding:16px;background:#f6f7f9;border-radius:8px">',
      escapeHtml(message),
      "</div>",
      '<p style="margin:16px 0 0;font-size:12px;color:#888">',
      "Submitted via the contact form at 1n599inc.ai — reply directly to this email to respond to the sender.",
      "</p></div>",
    ].join("");

    try {
      const result = await env.EMAIL.send({
        to: CONTACT_TO,
        from: CONTACT_FROM,
        // Replying in the mail client goes straight back to the visitor. This is
        // the whole reason to collect their address.
        replyTo: { email, name },
        subject,
        text,
        html,
      });

      return json({ ok: true, id: result.messageId }, 200);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      // Logged, never returned: provider errors can echo internal configuration.
      console.error("Email send failed:", e.code, e.message);
      return json({ error: "send_failed" }, 502);
    }
  },
};

export default handler;
