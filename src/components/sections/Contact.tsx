// =============================================================================
// FILE: src/components/sections/Contact.tsx
// PURPOSE: Contact section with info, form, and footer.
// =============================================================================

import { MapPin, Mail, ExternalLink } from "lucide-react";
import { COMPANY } from "@/lib/constants";

export default function Contact() {
  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Ready to explore how AI can transform your business? Let&apos;s connect.
          </p>
        </div>

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
      </div>

      {/* Footer */}
      <footer className="mt-32 pt-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold tracking-tight text-white">
            <span className="gradient-text">1N599</span> Labs
          </span>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <p className="text-sm text-slate-400 italic">
            &ldquo;{COMPANY.mission}&rdquo;
          </p>
        </div>
      </footer>
    </section>
  );
}
