// =============================================================================
// FILE: src/lib/posthog.tsx
// PURPOSE: Load PostHog only after the visitor consents to analytics.
//
//          NEXT_PUBLIC_POSTHOG_KEY is inlined at `next build`. If it is unset,
//          every export here is a no-op — the site still deploys, the banner
//          still records a choice, and no third-party request is made.
//
//          Do not point this at TheReelty's PostHog project. This host needs its
//          own 1N599 Inc project key.
// =============================================================================

"use client";

import { useEffect, type ReactNode } from "react";
import { hasAnalyticsConsent, subscribeConsent } from "./consent";
import type { FunnelEvent } from "./onboarding";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

type PostHogClient = {
  capture: (event: string) => void;
  opt_in_capturing: () => void;
  opt_out_capturing: () => void;
  reset: () => void;
};

let client: PostHogClient | null = null;
let starting: Promise<void> | null = null;
let loaded = false;
const pending: FunnelEvent[] = [];

function analyticsConfigured(): boolean {
  return Boolean(KEY);
}

async function startPostHog(): Promise<void> {
  if (!analyticsConfigured() || !hasAnalyticsConsent()) return;
  if (client) return;
  if (starting) return starting;

  starting = import("posthog-js").then(({ default: posthog }) => {
    if (!loaded) {
      posthog.init(KEY as string, {
        api_host: HOST,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: false,
        disable_session_recording: true,
        persistence: "localStorage+cookie",
      });
      loaded = true;
    } else {
      posthog.opt_in_capturing();
    }
    client = posthog;
    starting = null;
    while (pending.length > 0) {
      const event = pending.shift();
      if (event) posthog.capture(event);
    }
  });

  return starting;
}

function stopPostHog(): void {
  pending.length = 0;
  if (!client) return;
  client.opt_out_capturing();
  client.reset();
  client = null;
  starting = null;
}

export function captureFunnelEvent(event: FunnelEvent): void {
  if (!analyticsConfigured() || !hasAnalyticsConsent()) return;
  if (client) {
    client.capture(event);
    return;
  }
  pending.push(event);
  void startPostHog();
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const sync = () => {
      if (hasAnalyticsConsent()) void startPostHog();
      else stopPostHog();
    };
    sync();
    return subscribeConsent(sync);
  }, []);

  return children;
}
