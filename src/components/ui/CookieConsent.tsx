// =============================================================================
// FILE: src/components/ui/CookieConsent.tsx
// PURPOSE: GDPR/ePrivacy banner for optional PostHog analytics.
//
//          Shown until the visitor chooses. Analytics cookies are not set until
//          they accept. Rejecting (or ignoring the banner) leaves PostHog
//          unloaded. The choice is stored in localStorage — see src/lib/consent.ts.
// =============================================================================

"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  readConsent,
  subscribeConsent,
  writeConsent,
  type ConsentDecision,
} from "@/lib/consent";

const PANEL =
  "rounded-2xl border border-white/15 bg-[#030712]/95 backdrop-blur-md shadow-xl shadow-black/40";

function ChoiceButtons({
  onChoose,
  size = "banner",
}: {
  onChoose: (decision: Exclude<ConsentDecision, "undecided">) => void;
  size?: "banner" | "compact";
}) {
  const btn =
    size === "banner"
      ? "px-4 py-2 rounded-full text-sm font-semibold transition-colors"
      : "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChoose("analytics")}
        className={`${btn} bg-gradient-to-r from-cyan-700 to-violet-600 text-white hover:shadow-lg hover:shadow-cyan-500/20`}
      >
        Accept analytics
      </button>
      <button
        type="button"
        onClick={() => onChoose("necessary")}
        className={`${btn} border border-white/20 bg-white/5 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300`}
      >
        Essential only
      </button>
    </div>
  );
}

const subscribeClientOnly = () => () => {};

export default function CookieConsent() {
  const mounted = useSyncExternalStore(subscribeClientOnly, () => true, () => false);
  const decision = useSyncExternalStore(
    subscribeConsent,
    readConsent,
    () => "undecided" as ConsentDecision,
  );

  if (!mounted || decision !== "undecided") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-copy"
      className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6 pointer-events-none"
    >
      <div
        className={`${PANEL} pointer-events-auto mx-auto max-w-3xl p-5 sm:p-6`}
      >
        <h2
          id="cookie-consent-title"
          className="text-base font-semibold text-white mb-2"
        >
          Cookies and analytics
        </h2>
        <p id="cookie-consent-copy" className="text-sm text-slate-300 leading-relaxed mb-4">
          We use optional analytics (PostHog) only if you agree, so we can see
          which parts of this site help visitors. We do not run advertising or
          session recording, and we do not log assistant conversations. Necessary
          storage remembers this choice and, on the homepage, your getting-started
          progress. See the{" "}
          <Link
            href="/cookies"
            className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <ChoiceButtons onChoose={writeConsent} />
      </div>
    </div>
  );
}

export function ConsentControls() {
  const decision = useSyncExternalStore(
    subscribeConsent,
    readConsent,
    () => "undecided" as ConsentDecision,
  );

  const status =
    decision === "analytics"
      ? "Analytics accepted. PostHog may run on this device."
      : decision === "necessary"
        ? "Essential only. Analytics is off on this device."
        : "You have not chosen yet. Analytics stays off until you accept.";

  return (
    <div className={`${PANEL} p-5 sm:p-6`}>
      <p className="text-sm text-slate-300 mb-4">{status}</p>
      <ChoiceButtons
        size="compact"
        onChoose={(choice) => {
          writeConsent(choice);
        }}
      />
      {decision === "analytics" ? (
        <p className="text-xs text-slate-500 mt-3">
          Changing to essential only stops new analytics requests from this
          browser and clears the PostHog identity stored here.
        </p>
      ) : null}
    </div>
  );
}
