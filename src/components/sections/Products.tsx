// =============================================================================
// FILE: src/components/sections/Products.tsx
// PURPOSE: The four 1N599 products as linked tiles (logo, category, one-line
//          summary, website), followed by how we build for other industries.
//          Product data comes from content/knowledge.ts, the same source the
//          AI assistant answers from, so the tiles and the assistant agree.
// =============================================================================

"use client";

import Image from "next/image";
import { ArrowUpRight, CloudCog, Workflow } from "lucide-react";
import NextSectionCue from "@/components/ui/NextSectionCue";
import { completeOnboardingStep } from "@/lib/onboarding";
import { PRODUCTS } from "../../../content/knowledge";

// Per-product accent: glow behind the tile, hover border, and link colour.
const ACCENTS: Record<string, { glow: string; border: string; text: string; chip: string }> = {
  thereelty: {
    glow: "from-violet-500/30 via-fuchsia-500/10 to-transparent",
    border: "group-hover:border-violet-400/50",
    text: "text-violet-300",
    chip: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  },
  medifisys: {
    glow: "from-emerald-500/30 via-teal-500/10 to-transparent",
    border: "group-hover:border-emerald-400/50",
    text: "text-emerald-300",
    chip: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  },
  bonafidehire: {
    glow: "from-indigo-500/30 via-blue-500/10 to-transparent",
    border: "group-hover:border-indigo-400/50",
    text: "text-indigo-300",
    chip: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
  },
  sourced: {
    glow: "from-cyan-500/30 via-sky-500/10 to-transparent",
    border: "group-hover:border-cyan-400/50",
    text: "text-cyan-300",
    chip: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  },
};

const CAPABILITIES = [
  {
    icon: Workflow,
    title: "Customized for your industry",
    description:
      "We apply our product-building experience to new opportunities, tailoring AI capabilities to your users, workflows, data, and market.",
  },
  {
    icon: CloudCog,
    title: "From opportunity to launch",
    description:
      "Bring us an industry challenge or product opportunity. We design, build, integrate, and scale a dependable AI product around it.",
  },
];

function hostname(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

export default function Products() {
  return (
    <section id="products" className="relative overflow-hidden bg-[#030712] px-6 py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url(/images/domains.jpg)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#030712] via-[#030712]/80 to-[#030712]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/4 h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            {PRODUCTS.length} products, one company
          </span>
          <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl">
            Our <span className="gradient-text">Products</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            AI products built for real estate, healthcare, hiring and marketing.
            Pick one to visit its website.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {PRODUCTS.map((product) => {
            const accent = ACCENTS[product.id] ?? ACCENTS.sourced;
            return (
              <a
                key={product.id}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${product.name}: ${product.summary} Visit ${hostname(product.url)}`}
                onClick={
                  product.id === "thereelty"
                    ? () => completeOnboardingStep("opened_the_reelty")
                    : undefined
                }
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-black/40 ${accent.border}`}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br ${accent.glow} opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                />

                <div className="relative mb-8 flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] shadow-lg shadow-black/30 transition-transform duration-500 group-hover:scale-105">
                    <Image src={product.logo} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${accent.chip}`}>
                    {product.category}
                  </span>
                </div>

                <h3 className="relative mb-3 text-2xl font-bold text-white">{product.name}</h3>
                <p className="relative mb-8 flex-1 leading-relaxed text-slate-300">{product.summary}</p>

                <span className={`relative inline-flex items-center gap-2 text-sm font-semibold ${accent.text}`}>
                  Visit {hostname(product.url)}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </a>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {CAPABILITIES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-300">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NextSectionCue href="#mission" label="Mission" />
    </section>
  );
}
