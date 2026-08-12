// =============================================================================
// FILE: src/components/sections/Hero.tsx
// PURPOSE: Hero section at the top of the landing page, built as a three-layer
//          composite that reads as slowly travelling through space:
//
//            LAYER 1  the space photograph, brightened, with a 90s Ken Burns
//                     push-in and slight diagonal drift (CSS transform only)
//            LAYER 2  a canvas starfield drifting outward toward the viewer
//            LAYER 3  the wordmark, tagline, motto and CTAs — static
//
//          Every layer is absolutely positioned inside the section, which is
//          overflow-hidden, so nothing here can alter page height, shift the
//          AI assistant section below, or introduce a scrollbar.
// =============================================================================

"use client";

import { useSyncExternalStore } from "react";
import Logo from "@/components/ui/Logo";
import Starfield from "@/components/three/Starfield";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Whether this device should get the starfield. This is external browser state
// (a media query, the viewport, the CPU), so it is read through
// useSyncExternalStore rather than assigned into state from an effect — that
// avoids the cascading re-render React 19 warns about, and means the hero
// responds live if the viewport or the motion preference changes.
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

  // Phones get the Ken Burns layer only: a second compositing layer plus a
  // canvas repaint is the wrong trade on a small screen and a small battery.
  if (window.innerWidth < 768) return false;

  // A low core count is a decent proxy for a device that will not enjoy this.
  return (navigator.hardwareConcurrency ?? 8) > 4;
}

// The server renders no canvas, so the first client render must agree.
const getServerSnapshot = () => false;

export default function Hero() {
  const showStarfield = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    // Geometry deliberately unchanged from before this redesign: 78vh keeps the
    // top of the AI assistant card above the fold, and pt-20 clears the navbar.
    <section
      id="hero"
      className="relative min-h-[78vh] flex items-center justify-center overflow-hidden pt-20 pb-8"
    >
      {/* ------------------------------------------- LAYER 1 — space photo */}
      {/* Inset negatively so the scale/drift can never expose an edge: the
          element is 12% larger than the box, giving 6% of bleed on every side. */}
      <div className="absolute -inset-[6%] z-0">
        <div
          className="hero-kenburns absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/domains.jpg)",
            // Lifting the photograph itself rather than dropping a lighter
            // overlay on top: the Earth's limb and city lights survive.
            filter: "brightness(1.35) saturate(1.15) contrast(1.05)",
          }}
        />
      </div>

      {/* Ambient brand glows — these lighten, they do not darken */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-72 h-96 bg-cyan-400/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[30%] right-[20%] w-64 h-72 bg-violet-500/16 rounded-full blur-[80px] animate-pulse [animation-delay:0.5s]" />
        <div className="absolute bottom-[25%] left-[30%] w-80 h-64 bg-cyan-300/12 rounded-full blur-[90px] animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-[50%] right-[15%] w-72 h-56 bg-pink-400/10 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Grid pattern overlay — barely there, adds a technical texture */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ---------------------------------------- LAYER 2 — canvas starfield */}
      {showStarfield && (
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <Starfield />
        </div>
      )}

      {/* Bottom fade so the hero blends into the section beneath it. Confined to
          the lower third, so it no longer flattens the whole photograph. */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 z-[3] bg-gradient-to-b from-transparent to-[#030712] pointer-events-none" />

      {/* ------------------------------- LAYER 3 — text block, left untouched */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Radial scrim — deliberately a CHILD of the text block, inset outward,
            so it always covers the text at any viewport. A fixed-size ellipse
            centred on the section fell short of the taller mobile layout and
            dropped the tagline to 3.9:1. Sized from the content, it cannot.
            Negative z-index keeps it behind the text but, being inside this
            stacking context, still above the photograph and starfield. */}
        <div
          aria-hidden="true"
          className="absolute -inset-x-[14%] -inset-y-[12%] -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(3,7,18,0.88) 0%, rgba(3,7,18,0.82) 42%, rgba(3,7,18,0.6) 62%, rgba(3,7,18,0.24) 78%, rgba(3,7,18,0) 90%)",
          }}
        />
        <div className="flex justify-center mb-5">
          <Logo size={96} showText={false} />
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          <span className="gradient-text">1N599</span>
          <span className="text-white"> Inc</span>
        </h1>

        {/* slate-200 rather than the original slate-400. This line is 18-20px
            and light-weight, so WCAG treats it as normal text needing 4.5:1 —
            it does not get the 3:1 large-text allowance the motto does. */}
        <p className="text-lg sm:text-xl text-slate-200 mb-3 font-light">
          AI products built to adapt across industries
        </p>

        <p className="text-2xl sm:text-3xl font-semibold italic text-white mb-8">
          &ldquo;Engineering intelligence, empowering humanity&rdquo;
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#products"
            // cyan-700 rather than cyan-500 at the light end. White on cyan-500
            // measured 2.36:1, which fails WCAG AA even at the large-text
            // threshold — a pre-existing issue, but the brightened hero is no
            // place to leave the main CTA unreadable. Same gradient direction,
            // two steps darker at the light end only.
            className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-700 to-violet-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
          >
            Explore Our Products
          </a>
          <a
            href="#contact"
            className="px-8 py-4 rounded-full border border-slate-600 bg-[#030712]/50 backdrop-blur-sm text-slate-200 font-semibold text-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300"
          >
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}
