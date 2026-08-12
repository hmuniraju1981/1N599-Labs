// =============================================================================
// FILE: src/components/layout/SpaceScene.tsx
// PURPOSE: One continuous space scene spanning BOTH the hero and the AI
//          assistant section. Previously each section owned its own background,
//          which produced a hard horizontal line where the photograph stopped
//          and a flat near-black band began.
//
//          Everything visual lives here now:
//            LAYER 1  the photograph, brightened, with the Ken Burns drift
//            LAYER 2  the starfield canvas
//            LAYER 3  a full-bleed radial scrim for text legibility
//            LAYER 4  a vertical fade into whatever section comes next
//          Children (hero, assistant) render above all of it, transparent.
//
//          Because the wrapper spans both sections, the drift and the starfield
//          continue behind the assistant card instead of stopping mid-page.
// =============================================================================

"use client";

import { useSyncExternalStore } from "react";
import Starfield from "@/components/three/Starfield";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Whether this device should get the starfield. Read through
// useSyncExternalStore because it is external browser state (a media query, the
// viewport, the CPU) — assigning it from an effect would cause a cascading
// re-render, and this way the scene reacts live to changes.
function subscribe(onChange: () => void) {
  const motion = window.matchMedia(REDUCED_MOTION);
  motion.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    motion.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function getSnapshot(): boolean {
  if (window.matchMedia(REDUCED_MOTION).matches) return false;
  // Phones get the Ken Burns layer only — a canvas repaint is the wrong trade
  // on a small screen and a small battery.
  if (window.innerWidth < 768) return false;
  // Low core count is a reasonable proxy for a device that will not enjoy this.
  return (navigator.hardwareConcurrency ?? 8) > 4;
}

// The server renders no canvas, so the first client render must agree.
const getServerSnapshot = () => false;

export default function SpaceScene({ children }: { children: React.ReactNode }) {
  const showStarfield = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <div className="relative overflow-hidden">
      {/* ------------------------------------------- LAYER 1 — the photograph */}
      {/* Inset negatively so the scale and drift can never expose an edge:
          12% larger than the box gives 6% of bleed on every side. */}
      {/* The outer element pans (43s), the inner scales (32s). Two elements
          because one cannot animate `transform` on two independent clocks.
          -6% inset plus the 1.28 scale leaves ample bleed: the scaled image
          extends ~15% of the container past each edge, against a maximum 3%
          pan, so no edge can ever be exposed. */}
      <div className="hero-kenburns-pan absolute -inset-[6%] z-0">
        <div
          className="hero-kenburns absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/domains.jpg)",
            filter: "brightness(1.35) saturate(1.15) contrast(1.05)",
          }}
        />
      </div>

      {/* ------------------------------------------- LAYER 2 — the starfield */}
      {showStarfield && (
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <Starfield />
        </div>
      )}

      {/* NOTE: the radial text scrim is NOT here. It lives in Hero, full-bleed
          across the hero box. Positioning it on this wrapper put its centre at
          45% of the combined height — roughly 554px of 1232 — which is below the
          hero text, and the hero tagline measured 2.0:1 as a result. Anchoring
          it to the hero keeps it behind the text it exists to protect. */}

      {/* ------------------------------------ LAYER 3 — fade into next section */}
      <div
        aria-hidden="true"
        data-testid="scene-fade"
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 55%, rgba(3,7,18,0.75) 85%, #030712 100%)",
        }}
      />

      {/* ------------------------------------------------- content, above all */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
