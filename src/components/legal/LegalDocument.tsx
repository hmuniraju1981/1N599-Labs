// =============================================================================
// FILE: src/components/legal/LegalDocument.tsx
// PURPOSE: Shared page shell for every policy document — navbar, title block,
//          "last updated" line, the prose column, cross-links to the sibling
//          policies, and the site footer.
//
// WHY A SHELL RATHER THAN FIVE FULL PAGES: the only thing that differs between
//          the policies is the prose. Keeping the chrome in one place means the
//          policies cannot disagree about their own effective date, and a fix to
//          the reading layout lands on all five at once.
//
// READING WIDTH: the prose column is capped at ~68 characters per line
//          (max-w-3xl at this font size). Long-form legal text set to the full
//          width of a 27-inch monitor is what makes people close the tab, and
//          "nobody read it" is a genuine enforceability risk for terms.
// =============================================================================

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import SiteFooter from "@/components/ui/SiteFooter";
import {
  COMPANY,
  LEGAL_LAST_UPDATED,
  LEGAL_LAST_UPDATED_ISO,
  LEGAL_LINKS,
} from "@/lib/constants";

export default function LegalDocument({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  // Everything except the policy being read, for the cross-link row.
  const otherPolicies = LEGAL_LINKS.filter((link) => link.title !== title);

  return (
    <main className="relative min-h-screen">
      <Navbar />

      {/* Ambient brand glows, matching the landing page's treatment so the policy
          pages read as part of the same site rather than a bolted-on afterthought.
          Purely decorative, hence aria-hidden and pointer-events-none. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 right-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      {/* pt-32 clears the fixed navbar. */}
      <article className="relative max-w-3xl mx-auto px-6 pt-32 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to 1N599 Inc
        </Link>

        <header className="mb-10 pb-8 border-b border-white/10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-slate-300 leading-relaxed">{intro}</p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-slate-500">Last updated:</dt>
              {/* <time> needs a machine-readable dateTime; the human-readable
                  form stays as the visible text. */}
              <dd className="text-slate-300">
                <time dateTime={LEGAL_LAST_UPDATED_ISO}>{LEGAL_LAST_UPDATED}</time>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500">Entity:</dt>
              <dd className="text-slate-300">{COMPANY.name}</dd>
            </div>
          </dl>
        </header>

        {/* The policy body. space-y-10 separates top-level clauses. */}
        <div className="space-y-10">{children}</div>

        {/* --------------------------------------------------- CROSS-LINKS -- */}
        <nav
          aria-label="Other policies"
          className="mt-16 pt-8 border-t border-white/10"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Related policies
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {otherPolicies.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block h-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-cyan-500/40 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="block text-sm font-medium text-slate-100">
                    {link.title}
                  </span>
                  <span className="block text-xs text-slate-400 mt-1">
                    {link.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <SiteFooter />
      </article>
    </main>
  );
}
