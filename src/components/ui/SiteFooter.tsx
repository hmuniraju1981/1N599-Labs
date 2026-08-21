// =============================================================================
// FILE: src/components/ui/SiteFooter.tsx
// PURPOSE: The site-wide footer, including the legal/policy links.
//
// WHY IT IS A COMPONENT: the footer markup previously lived inline inside
//          Founder.tsx and was duplicated again in the unused Contact.tsx. Now
//          that the policy pages need the same footer, a third copy would have
//          guaranteed the legal links ended up present on some pages and missing
//          on others — which for policy links is the one thing that must not
//          happen, since discoverability is the point of publishing them.
//
// `bordered` exists because the landing page renders this inside a section that
// already provides its own separation, whereas the policy pages need the rule.
// =============================================================================

import Link from "next/link";
import { COMPANY, LEGAL_LINKS } from "@/lib/constants";

export default function SiteFooter({ bordered = true }: { bordered?: boolean }) {
  return (
    <footer className={bordered ? "mt-20 pt-8 border-t border-white/10" : "mt-20 pt-8"}>
      {/* Legal links row. `nav` with an accessible name so screen-reader users
          can jump straight to it, since these are the links people actively hunt
          for rather than stumble across. */}
      <nav aria-label="Legal" className="mb-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity"
        >
          <span className="gradient-text">1N599</span> Inc
        </Link>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            {/* Rendered at build time. The site is statically exported, so this
                is the year of the last deploy rather than the visitor's current
                year — accurate for a copyright notice, which dates publication. */}
            &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 mt-1" style={{ whiteSpace: "pre-line" }}>
            {COMPANY.address.full}
          </p>
        </div>

        <p className="text-sm text-slate-300 italic">&ldquo;{COMPANY.mission}&rdquo;</p>
      </div>
    </footer>
  );
}
