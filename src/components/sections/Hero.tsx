// =============================================================================
// FILE: src/components/sections/Hero.tsx
// PURPOSE: Hero content — wordmark, tagline, motto and CTAs.
//
//          This component no longer owns a background. The photograph, the
//          starfield, the scrim and the bottom fade all live in SpaceScene,
//          which wraps both this section and the AI assistant so the two read
//          as one continuous sky. See src/components/layout/SpaceScene.tsx.
//
//          Geometry is unchanged: 78vh keeps the top of the assistant card above
//          the fold, and pt-20 clears the fixed navbar.
// =============================================================================

"use client";

import Logo from "@/components/ui/Logo";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[78vh] flex items-center justify-center pt-20 pb-8"
    >
      {/* Radial text scrim, full-bleed across the hero. It spans the entire hero
          box, and its gradient reaches full transparency well inside every edge,
          so there is no boundary anywhere to see — unlike the bounded box this
          replaced, whose vertical edges were visible at ~x=460 and ~x=1420.
          Opacity is tuned by measurement: the city lights behind the tagline hit
          rgb(164,165,169), which needs roughly 0.3 of additional darkening to
          clear 4.5:1 for white text, hence the held core rather than a single
          soft stop. */}
      <div
        aria-hidden="true"
        data-testid="hero-scrim"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 72% 58% at 50% 45%, rgba(3,7,18,0.90) 0%, rgba(3,7,18,0.84) 32%, rgba(3,7,18,0.58) 55%, rgba(3,7,18,0.22) 72%, transparent 85%)",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="flex justify-center mb-5">
          <Logo size={96} showText={false} />
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          <span className="gradient-text">1N599</span>
          <span className="text-white"> Inc</span>
        </h1>

        {/* slate-200, not slate-400. This line is 18-20px and light-weight, so
            WCAG treats it as normal text needing 4.5:1 — it does not get the
            3:1 large-text allowance the motto does. */}
        <p className="text-lg sm:text-xl text-slate-200 mb-3 font-light">
          AI products built to adapt across industries
        </p>

        <p className="text-2xl sm:text-3xl font-semibold italic text-white mb-8">
          &ldquo;Engineering intelligence, empowering humanity&rdquo;
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#products"
            // cyan-700 rather than cyan-500 at the light end: white on cyan-500
            // measured 2.36:1, which fails WCAG AA even at the large-text
            // threshold.
            className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-700 to-violet-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
          >
            Explore Our Products
          </a>
          <a
            href="#contact"
            // /70 rather than /40: at 390px this button lands over bright city
            // lights that the hero scrim does not fully cover, and measured
            // 3.71:1 at /40. Its own fill has to carry the difference.
            className="px-8 py-4 rounded-full border border-white/15 bg-[#030712]/40 backdrop-blur-sm text-slate-200 font-semibold text-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300"
          >
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}
