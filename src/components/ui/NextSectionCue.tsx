// =============================================================================
// FILE: src/components/ui/NextSectionCue.tsx
// PURPOSE: Bottom-of-section "next" button: the next section's name above a
//          bouncing arrow. Every section except the last one renders it, so the
//          page can be walked top to bottom with one click per screen.
//          The parent section must be `relative`.
// =============================================================================

import { ChevronDown } from "lucide-react";

export default function NextSectionCue({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={`Scroll to ${label}`}
      className="group absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-300 transition-colors hover:text-cyan-300"
    >
      {label}
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-sm transition-colors group-hover:border-cyan-400/50 group-hover:bg-cyan-400/10">
        <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
      </span>
    </a>
  );
}
