// =============================================================================
// FILE: src/components/sections/Founder.tsx
// PURPOSE: Combined Team & Contact section with team background image.
// =============================================================================

import { MapPin, Mail, ExternalLink } from "lucide-react";
import ContactForm from "./ContactForm";
import SiteFooter from "@/components/ui/SiteFooter";
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
            Our team builds and grows intelligent products, starting with our real estate
            solution. We also welcome product opportunities in any industry and can customize
            AI capabilities around your market, workflows, users, and goals.
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
                  <p className="text-slate-300 font-medium">Location</p>
                  <p className="text-slate-400" style={{ whiteSpace: "pre-line" }}>{COMPANY.address.full}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-300 font-medium">Email</p>
                  {/* Was plain text, which gave visitors nothing to click and no
                      way to copy it reliably on a phone. */}
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 decoration-slate-600 hover:decoration-cyan-400 transition-colors break-all"
                  >
                    {COMPANY.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 flex-shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-300 font-medium">Website</p>
                  <a
                    href={`https://${COMPANY.domain}`}
                    className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 decoration-slate-600 hover:decoration-cyan-400 transition-colors break-all"
                  >
                    www.{COMPANY.domain}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glow-card glass rounded-3xl p-8">
            <h3 className="text-xl font-semibold text-slate-100 mb-6">
              Send a Message
            </h3>
            {/* Extracted into a client component: this section stays a Server
                Component, and only the form ships interactive JS. */}
            <ContactForm />
          </div>
        </div>

        {/* Shared with the policy pages, so the legal links cannot go missing on
            one and not the other. */}
        <SiteFooter />
      </div>
    </section>
  );
}
