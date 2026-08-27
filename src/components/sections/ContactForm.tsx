// =============================================================================
// FILE: src/components/sections/ContactForm.tsx
// PURPOSE: The "Send a Message" form in the contact section.
//
//          This replaces a <form> that had no onSubmit, no name attributes and
//          no state. Pressing "Send Message" performed a default GET submit,
//          which simply reloaded the page and silently discarded the message —
//          the form looked functional and delivered nothing.
//
//          Posts to /api/contact, which validates and rate-limits the submission
//          and hands it to Cloudflare Email Service. See functions/api/contact.ts.
//
// WHY A CLIENT COMPONENT: the surrounding section is a Server Component, but a
//          form needs local state and an event handler, so only this leaf opts
//          into the client bundle.
// =============================================================================

"use client";

import { useCallback, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { completeOnboardingStep } from "@/lib/onboarding";

// Kept in sync with the caps enforced in functions/api/contact.ts. Client-side
// limits are a courtesy to the user, never a security boundary — the server
// re-checks every one of them.
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 10;

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  // `offerMailto` is set when the failure is one that retrying will not fix, so
  // the visitor is handed a mail client instead of a dead end.
  | { kind: "error"; message: string; offerMailto: boolean };

// Builds a prefilled mailto: URL as the escape hatch. This is the fallback, not
// the primary path: mailto depends on the visitor having a configured mail
// client, which many do not, so it is never the first thing we reach for.
function mailtoUrl(email: string, message: string): string {
  const params = new URLSearchParams({
    subject: "Enquiry via 1n599inc.ai",
    body: message ? `${message}\n\n---\nReply-to: ${email}` : "",
  });
  return `mailto:${COMPANY.email}?${params.toString()}`;
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // Honeypot — see the hidden field below.
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isSending = status.kind === "sending";

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      // Without this the browser performs its default navigation and the page
      // reloads — the original bug.
      event.preventDefault();
      if (isSending) return;

      // Validate before spending a request. The server enforces the same rules.
      const trimmedMessage = message.trim();
      if (trimmedMessage.length < MIN_MESSAGE) {
        setStatus({
          kind: "error",
          message: `Please write at least ${MIN_MESSAGE} characters so we can help properly.`,
          offerMailto: false,
        });
        return;
      }

      setStatus({ kind: "sending" });

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            message: trimmedMessage,
            company,
          }),
        });

        if (res.ok) {
          setStatus({ kind: "sent" });
          completeOnboardingStep("sent_enquiry");
          // Clear the fields so a success message cannot be mistaken for an
          // unsent draft still sitting in the form.
          setName("");
          setEmail("");
          setMessage("");
          return;
        }

        const body = (await res.json().catch(() => null)) as { error?: string } | null;

        switch (body?.error) {
          case "invalid_submission":
            setStatus({
              kind: "error",
              message: "Please check your email address and message, then try again.",
              offerMailto: false,
            });
            return;
          case "rate_limited":
            setStatus({
              kind: "error",
              message:
                "You have sent several messages recently. Please try again a little later.",
              offerMailto: true,
            });
            return;
          default:
            // Covers not_configured, send_failed and anything unforeseen: the
            // visitor cannot act on the distinction, so give them the fallback.
            setStatus({
              kind: "error",
              message: "We could not send that from here.",
              offerMailto: true,
            });
        }
      } catch {
        // Network-level failure — offline, DNS, blocked request.
        setStatus({
          kind: "error",
          message: "Network error. Please check your connection and try again.",
          offerMailto: true,
        });
      }
    },
    [company, email, isSending, message, name],
  );

  // ---------------------------------------------------------------- SUCCESS
  // Replaces the form outright. Leaving an empty form beside a success notice
  // reads as though nothing happened.
  if (status.kind === "sent") {
    return (
      <div
        className="flex flex-col items-center justify-center text-center py-8"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="w-12 h-12 text-cyan-400 mb-4" aria-hidden="true" />
        <h4 className="text-lg font-semibold text-white mb-2">Message sent</h4>
        <p className="text-slate-300 text-sm max-w-xs">
          Thanks for getting in touch. We have your message and will reply to you
          by email shortly.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------- FIELD STYLE
  // These fields sit on a translucent "glass" card over a bright, busy
  // photograph. The original styling (bg-white/5, border-white/10,
  // placeholder:text-slate-500) let all of that show through, so the inputs had
  // almost no edge and the placeholder text came out dim grey — the whole block
  // read as disabled, and was reported as "greyed out, can't send".
  //
  // Fixed by giving each field its own near-opaque dark backing instead of
  // relying on a 5%-white tint: the field now defines its own contrast rather
  // than inheriting whatever pixels happen to be behind it. Placeholder lifted
  // to slate-400 and the value text to white, so a filled field is clearly
  // distinguishable from an empty one.
  //
  // disabled: styling is kept, but now it looks meaningfully different from the
  // enabled state — previously the two were nearly identical, which is what made
  // the enabled form look broken.
  const inputClasses =
    "w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/20 text-white placeholder:text-slate-400 shadow-inner shadow-black/20 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 hover:border-white/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/20";

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {/* Labels are present for screen readers but visually hidden, because the
          card's own heading already communicates the purpose sighted users need
          and placeholders alone leave assistive tech with unlabelled inputs. */}
      <div>
        <label htmlFor="contact-name" className="sr-only">
          Your name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={MAX_NAME}
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSending}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="sr-only">
          Your email address
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={MAX_EMAIL}
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSending}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="sr-only">
          Your message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          maxLength={MAX_MESSAGE}
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSending}
          className={`${inputClasses} resize-none`}
        />
      </div>

      {/* -------------------------------------------------------- HONEYPOT --
          Hidden from people, irresistible to form-stuffing bots. Kept out of the
          accessibility tree with aria-hidden and out of the tab order with
          tabIndex={-1} so a screen-reader user is never asked to fill it in.
          Positioned off-screen rather than display:none, because some bots skip
          fields that are not rendered. */}
      <div className="absolute left-[-9999px] w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company (leave this field empty)</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {/* ----------------------------------------------------------- ERROR -- */}
      {status.kind === "error" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
        >
          <AlertCircle
            className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm text-red-200">
            {status.message}
            {status.offerMailto && (
              <>
                {" "}
                <a
                  href={mailtoUrl(email, message)}
                  className="font-medium text-red-100 underline underline-offset-2 hover:text-white"
                >
                  Email us directly instead
                </a>
                .
              </>
            )}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSending}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {isSending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" aria-hidden="true" />
            Send Message
          </>
        )}
      </button>

      <p className="text-xs text-slate-300 text-center">
        We use your message only to reply to you. See our{" "}
        <a
          href="/privacy"
          className="text-slate-100 underline underline-offset-2 hover:text-cyan-400 transition-colors"
        >
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
