// =============================================================================
// FILE: src/components/sections/Hero.tsx
// PURPOSE: Full-screen hero section displayed at the top of the landing page.
//          Features a CSS particle/grid background, company name, mission tagline,
//          call-to-action buttons, and a scroll indicator at the bottom.
//          Content is visible immediately (no JS dependency for visibility).
// =============================================================================

"use client";

import Logo from "@/components/ui/Logo";

export default function Hero() {
  return (
    // 78vh rather than a full screen: this leaves the top of the AI assistant
    // card visible below the fold on a standard laptop, so visitors see it on
    // landing instead of having to guess it is there. pt-20 clears the fixed navbar.
    <section id="hero" className="relative min-h-[78vh] flex items-center justify-center overflow-hidden pt-20 pb-8">

      {/* Background — digital globe/network visualization */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.45]" style={{ backgroundImage: 'url(/images/domains.jpg)' }} />
      </div>

      {/* Glowing light effects — futuristic tech glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[15%] w-72 h-96 bg-cyan-400/25 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[30%] right-[20%] w-64 h-72 bg-violet-500/20 rounded-full blur-[80px] animate-pulse [animation-delay:0.5s]" />
        <div className="absolute bottom-[25%] left-[30%] w-80 h-64 bg-cyan-300/15 rounded-full blur-[90px] animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-[50%] right-[15%] w-72 h-56 bg-pink-400/12 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
        <div className="absolute bottom-[30%] right-[35%] w-64 h-64 bg-violet-400/15 rounded-full blur-[80px] animate-pulse [animation-delay:1.2s]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Bottom gradient fade to blend into next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712] z-[1]" />

      {/* Main content — fully visible without JS */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        {/* Large logo mark displayed prominently */}
        <div className="flex justify-center mb-5">
          <Logo size={96} showText={false} />
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          <span className="gradient-text">1N599</span>
          <span className="text-white"> Inc</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 mb-3 font-light">
          AI products built to adapt across industries
        </p>

        <p className="text-2xl sm:text-3xl font-semibold italic text-slate-200 mb-8">
          &ldquo;Engineering intelligence, empowering humanity&rdquo;
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#products"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
          >
            Explore Our Products
          </a>
          <a
            href="#contact"
            className="px-8 py-4 rounded-full border border-slate-700 text-slate-300 font-semibold text-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300"
          >
            Get In Touch
          </a>
        </div>
      </div>

      {/* NOTE: the old scroll-indicator glyph lived here. It was removed when the
          hero shrank to 78vh — the AI assistant card now peeks above the fold and
          serves as the scroll affordance, and the glyph collided with it. */}
    </section>
  );
}
