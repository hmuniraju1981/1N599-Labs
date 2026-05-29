// =============================================================================
// FILE: src/components/sections/Mission.tsx
// PURPOSE: Displays the company mission statement as a prominent section.
// =============================================================================

import { MISSION_STATS } from "@/lib/constants";

export default function Mission() {
  return (
    <section id="mission" className="py-32 px-6 relative overflow-hidden">
      {/* Healthcare background — clinical blue tone, very bright */}
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.6]" style={{ backgroundImage: 'url(/images/healthcare.jpg)' }} />
      <div className="absolute inset-0 bg-[#030712]/40" />
      {/* Glowing light effects — medical/tech highlights, bright */}
      <div className="absolute top-[20%] left-[10%] w-80 h-80 bg-cyan-300/30 rounded-full blur-[90px] animate-pulse" />
      <div className="absolute bottom-[25%] right-[15%] w-72 h-80 bg-pink-400/25 rounded-full blur-[80px] animate-pulse [animation-delay:1.2s]" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-400/15 rounded-full blur-[100px] animate-pulse [animation-delay:0.6s]" />

      <div className="relative max-w-4xl mx-auto text-center">
        <span className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-4 block">
          Our Mission
        </span>

        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          <span className="gradient-text">Engineering Intelligence,</span>
          <br />
          <span className="gradient-text">Empowering Humanity</span>
        </h2>

        <p className="text-xl sm:text-2xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-12">
          We pioneer AI systems that don&apos;t just automate — they augment
          human potential. Every model we train, every product we ship, is
          measured by one standard: does it make people&apos;s lives meaningfully
          better? That&apos;s the intelligence worth engineering.
        </p>

        <div className="grid sm:grid-cols-3 gap-8 mt-16">
          {MISSION_STATS.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6">
              <div className="text-4xl font-bold gradient-text mb-2">
                {stat.number}
              </div>
              <div className="text-slate-400 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
