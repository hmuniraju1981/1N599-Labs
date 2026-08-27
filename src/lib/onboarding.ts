// =============================================================================
// FILE: src/lib/onboarding.ts
// PURPOSE: Homepage getting-started checklist and the matching funnel events.
//
//          Progress is stored in localStorage under ONBOARDING_STORAGE_KEY so it
//          survives reloads on this origin only. It is never sent to the server
//          and is not shared with the product app (www.thereelty.com).
//
//          Completing a step also records the same-named PostHog event, but only
//          when the visitor has consented to analytics — see posthog.tsx.
// =============================================================================

export const ONBOARDING_STORAGE_KEY = "1n599-onboarding";

// Order is the funnel. Privacy copy, the checklist, and PostHog event names all
// derive from this list so they cannot drift.
export const FUNNEL_EVENTS = [
  "asked_assistant",
  "explored_products",
  "opened_the_reelty",
  "sent_enquiry",
  "shared_with_teammate",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export const ONBOARDING_STEPS: readonly {
  id: FunnelEvent;
  title: string;
  description: string;
  href?: string;
}[] = [
  {
    id: "asked_assistant",
    title: "Ask the assistant",
    description: "Send a question to the AI assistant on this page.",
    href: "/#assistant",
  },
  {
    id: "explored_products",
    title: "Explore products",
    description: "Look through what we build, starting with real estate.",
    href: "/#products",
  },
  {
    id: "opened_the_reelty",
    title: "Open TheReelty",
    description:
      "Visit our real estate product. It is a separate app — cookies are not shared with this site.",
  },
  {
    id: "sent_enquiry",
    title: "Send an enquiry",
    description: "Use the contact form to get in touch.",
    href: "/#contact",
  },
  {
    id: "shared_with_teammate",
    title: "Share with a teammate",
    description: "Send this page to a colleague.",
  },
];

const CHANGE_EVENT = "1n599-onboarding-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isFunnelEvent(value: unknown): value is FunnelEvent {
  return typeof value === "string" && (FUNNEL_EVENTS as readonly string[]).includes(value);
}

function parse(raw: string | null): FunnelEvent[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    const list = Array.isArray(data)
      ? data
      : data &&
          typeof data === "object" &&
          Array.isArray((data as { completed?: unknown }).completed)
        ? (data as { completed: unknown[] }).completed
        : [];
    return list.filter(isFunnelEvent);
  } catch {
    return [];
  }
}

// React 19's useSyncExternalStore compares snapshots with Object.is. parse()
// always returns a new array, which infinite-loops the checklist (the live
// "getServerSnapshot should be cached" crash). Keep the last raw string and
// parsed list so readOnboarding is referentially stable until storage changes.
let cachedRaw: string | null | undefined;
let cachedSteps: FunnelEvent[] = [];

export function readOnboarding(): FunnelEvent[] {
  if (!isBrowser()) return cachedSteps;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (raw === cachedRaw) return cachedSteps;
    cachedRaw = raw;
    cachedSteps = parse(raw);
    return cachedSteps;
  } catch {
    return cachedSteps;
  }
}

export function isOnboardingComplete(completed: FunnelEvent[] = readOnboarding()): boolean {
  return FUNNEL_EVENTS.every((id) => completed.includes(id));
}

export function subscribeOnboarding(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

// Idempotent: a step already marked done is not written again and does not
// fire a second analytics event, so the funnel counts first completions.
export function completeOnboardingStep(id: FunnelEvent): void {
  if (!isBrowser()) return;

  const completed = readOnboarding();
  if (completed.includes(id)) return;

  const next = [...completed, id];
  const serialized = JSON.stringify(next);
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, serialized);
  } catch {
    // Still notify this session if quota or private mode blocks persistence.
  }
  cachedRaw = serialized;
  cachedSteps = next;
  window.dispatchEvent(new Event(CHANGE_EVENT));

  void import("./posthog").then((mod) => {
    mod.captureFunnelEvent(id);
  });
}
