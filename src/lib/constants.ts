// =============================================================================
// FILE: src/lib/constants.ts
// PURPOSE: Application-wide constants and configuration data.
//          Centralizing data here keeps components clean and makes
//          content updates easy without touching component logic.
// =============================================================================

import { LegalLink, NavLink, Stat } from "@/types";

// -----------------------------------------------------------------------------
// NAVIGATION LINKS
// Used by the Navbar component to render both desktop and mobile navigation.
// Each object maps a display label to an anchor ID on the page.
// -----------------------------------------------------------------------------
// Root-relative ("/#about") rather than bare ("#about") deliberately. The navbar
// now renders on the policy pages too, and a bare fragment there points at an
// element that does not exist on /privacy — the links silently did nothing. With
// the leading slash they scroll on the homepage and navigate home from anywhere
// else.
export const NAV_LINKS: NavLink[] = [
  { href: "/#about", label: "About" },       // Scrolls to the About section
  { href: "/#products", label: "Products" },  // Scrolls to the Products section
  { href: "/#mission", label: "Mission" },    // Scrolls to the Mission section
  { href: "/#contact", label: "Contact" },    // Scrolls to the Team + Contact section
];

// -----------------------------------------------------------------------------
// LEGAL / POLICY PAGES
//
// Single source of truth for the policy documents. The footer renders this list,
// each policy page reads its own title and description from it for <head>
// metadata, and every policy cross-links to the others from it — so adding a new
// policy means adding one entry here and one page file, and nothing can drift
// out of sync.
//
// LAST_UPDATED is shown on every policy. It is a deliberate constant rather than
// a build timestamp: "last updated" on a legal document means "last time the
// terms changed", and wiring it to the build date would silently re-date every
// policy on an unrelated CSS tweak, which is misleading to users and useless as
// a compliance record.
// -----------------------------------------------------------------------------
// ISO form is the source of truth; the display string is derived from it so the
// two cannot drift. Both are needed: <time dateTime> and the sitemap require the
// machine-readable value, while the visible text should read naturally.
export const LEGAL_LAST_UPDATED_ISO = "2026-08-26";

export const LEGAL_LAST_UPDATED = new Date(
  `${LEGAL_LAST_UPDATED_ISO}T00:00:00Z`,
).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  // Without this the date is formatted in the build machine's zone, which for
  // anywhere west of UTC renders midnight UTC as the *previous* day.
  timeZone: "UTC",
});

export const LEGAL_LINKS: LegalLink[] = [
  {
    href: "/privacy",
    label: "Privacy",
    title: "Privacy Policy",
    description:
      "How 1N599 Inc collects, uses, shares and protects personal information, and the rights you have over your data.",
  },
  {
    href: "/terms",
    label: "Terms",
    title: "Terms of Service",
    description:
      "The terms governing your use of the 1N599 Inc website, AI assistant and related services.",
  },
  {
    href: "/cookies",
    label: "Cookies",
    title: "Cookie Policy",
    description:
      "What cookies and similar technologies the 1N599 Inc website uses, and how to control them.",
  },
  {
    href: "/acceptable-use",
    label: "Acceptable Use",
    title: "Acceptable Use Policy",
    description:
      "Conduct that is prohibited when using the 1N599 Inc website, AI assistant and services.",
  },
  {
    href: "/ai-disclaimer",
    label: "AI Disclaimer",
    title: "AI Assistant Terms & Disclaimer",
    description:
      "How the 1N599 Inc AI assistant works, its limitations, and the terms that apply when you use it.",
  },
];

// Looks up a policy by route. Throws rather than returning undefined so that a
// page and this list disagreeing is a *build* failure, not a page that silently
// ships with an empty <title> and no meta description.
export function legalLink(href: string): LegalLink {
  const found = LEGAL_LINKS.find((link) => link.href === href);
  if (!found) throw new Error(`No LEGAL_LINKS entry for "${href}"`);
  return found;
}

// -----------------------------------------------------------------------------
// MISSION STATISTICS
// Displayed as highlight cards within the Mission section.
// -----------------------------------------------------------------------------
export const MISSION_STATS: Stat[] = [
  { number: "1+", label: "AI Products & Growing" }, // Number of domains we serve
  { number: "Any", label: "Industry Opportunity" }, // Our core approach
  { number: "∞", label: "Commitment to You" },     // Symbolizes endless dedication
];

// -----------------------------------------------------------------------------
// COMPANY INFORMATION
// Centralized company details used across Contact and Footer components.
// -----------------------------------------------------------------------------
export const COMPANY = {
  name: "1N599 Inc",                                 // Legal company name
  domain: "1n599inc.ai",                            // Primary domain
  // The company landing (this host) and the product app are separate origins.
  // Cookies, localStorage and consent are not shared between them.
  productName: "TheReelty",
  productUrl: "https://www.thereelty.com",
  // Lowercase deliberately. Mailbox names are technically case-sensitive per
  // RFC 5321, and although every real provider treats them as insensitive,
  // displaying "contact@1n599Inc.ai" invited people to retype it with the
  // capital. All Email Routing rules for this zone are lowercase.
  email: "contact@1n599inc.ai",                     // Public contact email

  // Data-protection and security-report addresses cited in the legal pages.
  //
  // Both intentionally point at contact@ today. Inbound mail for this zone is
  // handled solely by Cloudflare Email Routing (MX → *.mx.cloudflare.net), which
  // only accepts addresses that have an explicit rule; the catch-all is disabled
  // and set to drop. As of writing the only routed mailboxes are founder@, hr@,
  // support@, info@, sales@ and contact@, so publishing privacy@ or security@
  // would advertise addresses that reject mail — worse than having none, because
  // a rejected privacy request is a compliance problem, not just a dead link.
  //
  // To split these out, add Email Routing rules for the new addresses first,
  // then change these two values. Nothing else needs to be touched.
  privacyEmail: "contact@1n599inc.ai",              // Data-protection requests
  securityEmail: "contact@1n599inc.ai",             // Vulnerability reports
  address: {
    street: "5900 Balcones Drive",                   // Street address
    suite: "# 8394",                                // Suite
    city: "Austin",                                 // City
    state: "TX",                                    // State
    zip: "78731",                                   // ZIP code
    full: "5900 Balcones Drive # 8394\nAustin, TX 78731", // Combined full address
  },
  mission: "Engineering intelligence, empowering humanity", // Company mission statement
  founder: {
    name: "Harsha Muniraju",                       // Founder's full name
    title: "Founder & CEO",                        // Role/title
    resumeUrl: "https://harsha-muniraju-resume.netlify.app/", // Portfolio URL
    githubUrl: "https://github.com/harsha",        // GitHub profile
    linkedinUrl: "https://linkedin.com/in/harsha-muniraju", // LinkedIn profile
  },
} as const; // 'as const' ensures these values are readonly and narrowly typed

// -----------------------------------------------------------------------------
// THEME COLORS
// Primary color tokens used in 3D scenes, gradients, and dynamic styling.
// These match the CSS custom properties defined in globals.css.
// -----------------------------------------------------------------------------
export const COLORS = {
  cyan: "#06b6d4",      // Primary accent - used for tech/innovation elements
  violet: "#8b5cf6",    // Secondary accent - used for AI/intelligence elements
  pink: "#ec4899",      // Tertiary accent - used for human/care elements
  background: "#030712", // Deep dark background (gray-950)
  foreground: "#f1f5f9", // Light text color (slate-100)
} as const;
