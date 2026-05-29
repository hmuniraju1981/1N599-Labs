// =============================================================================
// FILE: src/components/sections/Founder.tsx
// PURPOSE: Combined Team & Contact section with team background image.
// =============================================================================

import { MapPin, Mail, ExternalLink } from "lucide-react";
import { COMPANY } from "@/lib/constants";

export default function Founder() {
  return (
    <section id="contact" className="py-32 px-6 relative overflow-hidden">
      {/* Team discussion background — bright and vibrant */}
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.5]" style={{ backgroundImage: 'url(/images/team.jpg)' }} />
      <div className="absolute inset-0 bg-[#030712]/45" />
      {/* Glowing light effects */}
      <div className="absolute top-[15%] right-[20%] w-80 h-72 bg-cyan-400/25 rounded-full blur-[90px] animate-pulse" />
      <div className="absolute bottom-[20%] left-[10%] w-72 h-80 bg-violet-400/25 rounded-full blur-[90px] animate-pulse [animation-delay:1s]" />
      <div className="absolute top-[50%] left-[60%] w-64 h-64 bg-amber-300/15 rounded-full blur-[80px] animate-pulse [animation-delay:1.8s]" />
      <div className="relative max-w-6xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Meet the <span className="gradient-text">Team</span> & Get In Touch
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            A passionate group of innovators building the future of AI. Ready to connect?
          </p>
        </div>

        {/* Team description card */}
        <div className="glow-card glass rounded-3xl p-8 sm:p-10 mb-12 text-center max-w-3xl mx-auto">
          <p className="text-lg text-slate-200 leading-relaxed">
            Our team of engineers and researchers is passionate about leveraging AI
            to solve real-world problems across Real Estate, HR, and Healthcare.
            We build products that put people first and technology in service of humanity.
          </p>
        </div>

        {/* Contact grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="glow-card glass rounded-3xl p-8">
            <h3 className="text-xl font-semibold text-slate-100 mb-6">
              Contact Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Address</p>
                  <p className="text-slate-400">
                    {COMPANY.address.street}<br />
                    {COMPANY.address.city}, {COMPANY.address.state} {COMPANY.address.zip}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Email</p>
                  <p className="text-slate-400">{COMPANY.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 flex-shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Website</p>
                  <p className="text-slate-400">www.{COMPANY.domain}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glow-card glass rounded-3xl p-8">
            <h3 className="text-xl font-semibold text-slate-100 mb-6">
              Send a Message
            </h3>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xl font-bold tracking-tight text-white">
              <span className="gradient-text">1N599</span> Labs
            </span>
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
            </p>
            <p className="text-sm text-slate-300 italic">
              &ldquo;{COMPANY.mission}&rdquo;
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
