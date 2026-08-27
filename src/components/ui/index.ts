// =============================================================================
// FILE: src/components/ui/index.ts
// PURPOSE: Barrel export for UI (reusable) components.
//          Allows cleaner imports: import { Logo, Navbar } from "@/components/ui"
// =============================================================================

export { default as Logo } from "./Logo";       // Brand logo SVG component
export { default as Navbar } from "./Navbar";   // Navigation bar component
export { default as SiteFooter } from "./SiteFooter"; // Footer incl. legal links
export { default as ScrollToTop } from "./ScrollToTop"; // Scroll reset on load
export { default as CookieConsent } from "./CookieConsent";
export { default as OnboardingChecklist } from "./OnboardingChecklist";
