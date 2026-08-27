// =============================================================================
// FILE: src/components/ui/OnboardingChecklist.tsx
// PURPOSE: Homepage-only five-step getting-started checklist.
//
//          Collapsible until every step is done. Progress is local to this
//          origin (localStorage key 1n599-onboarding). Completing a step also
//          emits the matching funnel event when analytics consent is on.
// =============================================================================

"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Share2,
  X,
} from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { readConsent, subscribeConsent } from "@/lib/consent";
import {
  completeOnboardingStep,
  FUNNEL_EVENTS,
  isOnboardingComplete,
  ONBOARDING_STEPS,
  readOnboarding,
  subscribeOnboarding,
  type FunnelEvent,
} from "@/lib/onboarding";
import OpenTheReeltyLink from "@/components/sections/OpenTheReeltyLink";

const SITE_URL = `https://${COMPANY.domain}`;

const emptySteps: FunnelEvent[] = [];
const subscribeClientOnly = () => () => {};

export default function OnboardingChecklist() {
  const mounted = useSyncExternalStore(subscribeClientOnly, () => true, () => false);
  const completed = useSyncExternalStore(
    subscribeOnboarding,
    readOnboarding,
    () => emptySteps,
  );
  const consent = useSyncExternalStore(
    subscribeConsent,
    readConsent,
    () => "undecided" as const,
  );

  const done = isOnboardingComplete(completed);
  const [collapseOverride, setCollapseOverride] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const collapsed = collapseOverride ?? done;
  const bannerOpen = consent === "undecided";
  const count = FUNNEL_EVENTS.filter((id) => completed.includes(id)).length;

  useEffect(() => {
    const target = document.getElementById("products");
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          completeOnboardingStep("explored_products");
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const share = useCallback(async () => {
    const payload = {
      title: COMPANY.name,
      text: `${COMPANY.name} — ${COMPANY.mission}`,
      url: SITE_URL,
    };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(payload);
        completeOnboardingStep("shared_with_teammate");
        setShareStatus("Shared.");
        return;
      }
      await navigator.clipboard.writeText(SITE_URL);
      completeOnboardingStep("shared_with_teammate");
      setShareStatus("Link copied.");
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      if (name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(SITE_URL);
        completeOnboardingStep("shared_with_teammate");
        setShareStatus("Link copied.");
      } catch {
        setShareStatus("Could not share from this browser.");
      }
    }
  }, []);

  if (!mounted || dismissed) return null;

  return (
    <aside
      aria-label="Getting started"
      className={`fixed right-4 sm:right-6 z-[60] w-[min(100%-2rem,22rem)] ${
        bannerOpen ? "bottom-[13.5rem] sm:bottom-36" : "bottom-4 sm:bottom-6"
      }`}
    >
      <div className="rounded-2xl border border-white/15 bg-[#030712]/95 backdrop-blur-md shadow-xl shadow-black/40 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <button
            type="button"
            className="flex-1 min-w-0 text-left"
            onClick={() => setCollapseOverride(!collapsed)}
            aria-expanded={!collapsed}
          >
            <span className="block text-sm font-semibold text-white">
              Getting started
            </span>
            <span className="block text-xs text-slate-400">
              {done ? "All five steps complete" : `${count} of ${FUNNEL_EVENTS.length} complete`}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCollapseOverride(!collapsed)}
            className="p-1 text-slate-400 hover:text-cyan-300"
            aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {done ? (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-cyan-300"
              aria-label="Dismiss checklist"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {!collapsed && (
          <ol className="p-3 space-y-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const isDone = completed.includes(step.id);
              return (
                <li
                  key={step.id}
                  className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      isDone
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-white/10 text-slate-400"
                    }`}
                    aria-hidden="true"
                  >
                    {isDone ? <Check className="w-3 h-3" /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${isDone ? "text-slate-400 line-through" : "text-slate-100"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                    {!isDone && step.href ? (
                      <a
                        href={step.href}
                        className="inline-block mt-1.5 text-xs text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                      >
                        Go there
                      </a>
                    ) : null}
                    {!isDone && step.id === "opened_the_reelty" ? (
                      <div className="mt-2">
                        <OpenTheReeltyLink compact />
                      </div>
                    ) : null}
                    {!isDone && step.id === "shared_with_teammate" ? (
                      <button
                        type="button"
                        onClick={() => void share()}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                      >
                        <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Share this site
                      </button>
                    ) : null}
                    {step.id === "shared_with_teammate" && shareStatus ? (
                      <p className="text-xs text-slate-400 mt-1" role="status">
                        {shareStatus}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
}
