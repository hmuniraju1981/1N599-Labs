// =============================================================================
// FILE: src/components/ui/SectionNavigator.tsx
// PURPOSE: One floating "next section" button for the landing page. It shows the
//          name of the section after the one in view above an arrow; on the last
//          section it becomes "Back to top". It is fixed to the viewport, not to
//          each section, so it sits in the same spot at every window size and
//          never lands on top of a section's own content edge.
//
//          Below lg it sits higher, clearing the full-width onboarding checklist
//          pinned to the bottom-right. It hides while a text field is focused so
//          it never covers the assistant input or the contact form.
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Landing-page sections in scroll order. Ids match the <section id> attributes.
const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "assistant", label: "Ask AI" },
  { id: "about", label: "About" },
  { id: "products", label: "Products" },
  { id: "mission", label: "Mission" },
  { id: "contact", label: "Team & Contact" },
] as const;

// A section counts as "in view" once its top passes this fraction of the viewport.
const PROBE = 0.4;

function currentIndex(): number {
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) return SECTIONS.length - 1;

  const probe = window.innerHeight * PROBE;
  let index = 0;
  SECTIONS.forEach((section, i) => {
    const el = document.getElementById(section.id);
    if (el && el.getBoundingClientRect().top <= probe) index = i;
  });
  return index;
}

function isTextField(el: Element | null): boolean {
  return (
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLInputElement && !["button", "checkbox", "radio", "submit"].includes(el.type))
  );
}

export default function SectionNavigator() {
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIndex(currentIndex()));
    };
    const onFocus = () => setTyping(isTextField(document.activeElement));
    const onBlur = () => setTyping(false);

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
    };
  }, []);

  const next = SECTIONS[index + 1];
  const label = next ? next.label : "Back to top";
  const Arrow = next ? ChevronDown : ChevronUp;

  const go = () => {
    if (next) {
      document.getElementById(next.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={go}
      aria-label={next ? `Scroll to ${next.label}` : "Back to top"}
      className={cn(
        "group fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-all duration-300 lg:bottom-6",
        typing ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100",
      )}
    >
      <span className="whitespace-nowrap rounded-full border border-white/10 bg-[#030712]/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-200 shadow-lg shadow-black/30 backdrop-blur-md transition-colors group-hover:border-cyan-400/40 group-hover:text-cyan-300">
        {label}
      </span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#030712]/70 text-slate-200 shadow-lg shadow-black/30 backdrop-blur-md transition-colors group-hover:border-cyan-400/50 group-hover:bg-cyan-400/10 group-hover:text-cyan-300">
        <Arrow className={cn("h-4 w-4", next && "animate-bounce")} aria-hidden="true" />
      </span>
    </button>
  );
}
