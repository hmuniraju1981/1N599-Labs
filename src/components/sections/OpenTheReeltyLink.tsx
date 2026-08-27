// =============================================================================
// FILE: src/components/sections/OpenTheReeltyLink.tsx
// PURPOSE: Outbound link from this company landing site to the product app.
//
//          TheReelty lives at a different origin. Cookies and consent on
//          1n599inc.ai are not sent there, and vice versa. Clicking completes
//          the opened_the_reelty onboarding/funnel step.
// =============================================================================

"use client";

import { ExternalLink } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { completeOnboardingStep } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export default function OpenTheReeltyLink({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <a
      href={COMPANY.productUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => completeOnboardingStep("opened_the_reelty")}
      className={cn(
        "inline-flex items-center gap-2 font-semibold transition-colors",
        compact
          ? "text-xs text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
          : "self-start px-4 py-2 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-100 text-sm hover:bg-cyan-500/25 hover:border-cyan-300/60",
        className,
      )}
    >
      Open {COMPANY.productName}
      <ExternalLink className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} aria-hidden="true" />
    </a>
  );
}
