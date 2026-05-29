// =============================================================================
// FILE: src/components/sections/About.tsx
// PURPOSE: Introduces 1N599 Labs with a brief description and three feature
//          cards highlighting the company's core differentiators:
//          AI-First Approach, Domain Expertise, and Rapid Innovation.
// =============================================================================

import { Brain, Sparkles, Zap } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI-First Approach",
    desc: "Every product is built with artificial intelligence at its core, not bolted on as an afterthought.",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Domain Expertise",
    desc: "Deep understanding of Real Estate, HR, and Healthcare industries drives our product design.",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Rapid Innovation",
    desc: "From concept to deployment, we move fast to bring transformative solutions to market.",
  },
];

export default function About() {
  return (
    <section id="about" className="py-32 px-6 relative overflow-hidden">
      {/* HR background — team collaboration, very bright and visible */}
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.55]" style={{ backgroundImage: 'url(/images/hr.jpg)' }} />
      <div className="absolute inset-0 bg-[#030712]/45" />
      {/* Glowing light effects — warm office ambiance */}
      <div className="absolute top-[15%] left-[20%] w-72 h-80 bg-amber-300/25 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[15%] w-64 h-72 bg-violet-400/20 rounded-full blur-[90px] animate-pulse [animation-delay:1s]" />
      <div className="absolute top-[40%] right-[35%] w-56 h-56 bg-cyan-400/15 rounded-full blur-[70px] animate-pulse [animation-delay:2s]" />
      <div className="relative max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Building the <span className="gradient-text">Future</span> with AI
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            1N599 Labs is an AI startup focused on creating intelligent products
            that transform how people interact with technology across critical
            industries. We believe AI should serve humanity — always.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glow-card glass rounded-2xl p-8 text-center group hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-100">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
