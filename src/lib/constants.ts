// =============================================================================
// FILE: src/lib/constants.ts
// PURPOSE: Application-wide constants and configuration data.
//          Centralizing data here keeps components clean and makes
//          content updates easy without touching component logic.
// =============================================================================

import { NavLink, Stat } from "@/types";

// -----------------------------------------------------------------------------
// NAVIGATION LINKS
// Used by the Navbar component to render both desktop and mobile navigation.
// Each object maps a display label to an anchor ID on the page.
// -----------------------------------------------------------------------------
export const NAV_LINKS: NavLink[] = [
  { href: "#about", label: "About" },       // Scrolls to the About section
  { href: "#products", label: "Products" },  // Scrolls to the Products section
  { href: "#mission", label: "Mission" },    // Scrolls to the Mission section
  { href: "#contact", label: "Contact" },    // Scrolls to the Team + Contact section
];

// -----------------------------------------------------------------------------
// MISSION STATISTICS
// Displayed as highlight cards within the Mission section.
// -----------------------------------------------------------------------------
export const MISSION_STATS: Stat[] = [
  { number: "3", label: "Industry Verticals" },   // Number of domains we serve
  { number: "AI", label: "First Philosophy" },     // Our core approach
  { number: "∞", label: "Commitment to You" },     // Symbolizes endless dedication
];

// -----------------------------------------------------------------------------
// COMPANY INFORMATION
// Centralized company details used across Contact and Footer components.
// -----------------------------------------------------------------------------
export const COMPANY = {
  name: "1N599 Labs",                              // Legal company name
  domain: "1n599labs.com",                         // Primary domain
  email: "contact@1n599labs.com",                  // Public contact email
  address: {
    street: "401 Forsyth Drive",                   // Street address
    city: "Princeton",                             // City
    state: "Texas",                                // State
    zip: "75407",                                  // ZIP code
    full: "401 Forsyth Drive, Princeton, Texas 75407", // Combined full address
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
