// =============================================================================
// FILE: src/components/sections/Products.tsx
// PURPOSE: Showcases what 1N599 Inc builds: the shipping real estate product,
//          cross-industry product work, and product engineering.
//          Each card features a domain-specific background image.
// =============================================================================

import { BrainCircuit, Workflow, CloudCog } from "lucide-react";

const products = [
  {
    icon: <BrainCircuit className="w-10 h-10" />,
    domain: "Real Estate Product",
    title: "Intelligent Property Solutions",
    description:
      "Our existing AI-powered real estate product supports smarter property workflows, insights, and decisions for industry professionals.",
    accentColor: "text-cyan-400",
    bgAccent: "from-cyan-500/10 to-blue-500/10",
    image: "/images/real-estate.jpg",
    overlay: "from-[#030712]/90 via-[#030712]/80 to-cyan-950/70",
  },
  {
    icon: <Workflow className="w-10 h-10" />,
    domain: "Cross-Industry Products",
    title: "Customized for Your Industry",
    description:
      "We apply our product-building experience to new opportunities, tailoring AI capabilities to your users, workflows, data, and market.",
    accentColor: "text-violet-400",
    bgAccent: "from-violet-500/10 to-purple-500/10",
    image: "/images/team.jpg",
    overlay: "from-[#030712]/90 via-[#030712]/80 to-violet-950/70",
  },
  {
    icon: <CloudCog className="w-10 h-10" />,
    domain: "Product Engineering",
    title: "From Opportunity to Launch",
    description:
      "Bring us an industry challenge or product opportunity. We design, build, integrate, and scale a dependable AI product around it.",
    accentColor: "text-pink-400",
    bgAccent: "from-pink-500/10 to-rose-500/10",
    image: "/images/founder.jpg",
    overlay: "from-[#030712]/90 via-[#030712]/80 to-pink-950/70",
  },
];

export default function Products() {
  return (
    <section id="products" className="py-32 px-6 relative overflow-hidden">
      {/* Domains background — skyscrapers with bright city lights */}
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.5]" style={{ backgroundImage: 'url(/images/domains.jpg)' }} />
      <div className="absolute inset-0 bg-[#030712]/45" />
      {/* Glowing orbs */}
      <div className="absolute top-[10%] left-[10%] w-80 h-80 bg-cyan-400/25 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[15%] right-[10%] w-72 h-72 bg-violet-400/25 rounded-full blur-[90px] animate-pulse [animation-delay:1s]" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/15 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
      <div className="relative max-w-6xl mx-auto">

        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Our <span className="gradient-text">Products</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We build AI products, beginning with real estate, and customize our
            product expertise for opportunities across any industry.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.domain}
              className="relative rounded-3xl overflow-hidden group transition-all duration-500 flex flex-col border border-white/10 hover:border-white/20"
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              {/* Dark gradient overlay for text readability */}
              <div className={`absolute inset-0 bg-gradient-to-b ${product.overlay}`} />

              {/* Card content */}
              <div className="relative z-10 p-8 flex flex-col flex-1">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${product.bgAccent} backdrop-blur-sm flex items-center justify-center ${product.accentColor} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {product.icon}
                </div>
                <span
                  className={`text-sm font-semibold ${product.accentColor} uppercase tracking-wider mb-2`}
                >
                  {product.domain}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {product.title}
                </h3>
                <p className="text-slate-300 leading-relaxed flex-1 mb-6">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
