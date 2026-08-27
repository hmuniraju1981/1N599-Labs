// =============================================================================
// FILE: src/lib/consent.ts
// PURPOSE: First-party GDPR consent for optional analytics.
//
//          The choice is stored in localStorage (not a cookie) under
//          CONSENT_STORAGE_KEY. PostHog is initialised only after the visitor
//          opts in to ANALYTICS — see src/lib/posthog.tsx.
//
//          Necessary storage (this preference, and homepage onboarding progress)
//          does not require a banner under ePrivacy; the banner exists because
//          PostHog sets non-essential cookies once analytics is accepted.
// =============================================================================

export const CONSENT_STORAGE_KEY = "1n599-consent";

export type ConsentDecision = "undecided" | "necessary" | "analytics";

const CHANGE_EVENT = "1n599-consent-change";

type StoredConsent = {
  analytics: boolean;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parse(raw: string | null): ConsentDecision {
  if (!raw) return "undecided";
  try {
    const data = JSON.parse(raw) as StoredConsent;
    if (typeof data?.analytics !== "boolean") return "undecided";
    return data.analytics ? "analytics" : "necessary";
  } catch {
    return "undecided";
  }
}

export function readConsent(): ConsentDecision {
  if (!isBrowser()) return "undecided";
  try {
    return parse(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    // Safari private mode can throw on localStorage access.
    return "undecided";
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "analytics";
}

export function writeConsent(decision: Exclude<ConsentDecision, "undecided">): void {
  if (!isBrowser()) return;
  const record: StoredConsent = { analytics: decision === "analytics" };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Persistence failed; still notify so this session honours the click.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
