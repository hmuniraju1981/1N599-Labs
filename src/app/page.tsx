// =============================================================================
// FILE: src/app/page.tsx
// PURPOSE: Main landing page of the 1N599 Inc website.
//          This is a Server Component that composes all page sections together.
//          Each section is a separate client component imported from the
//          components directory, following the "sections" pattern.
//          The page renders as a single scrollable view with anchor navigation.
// =============================================================================

import Navbar from "@/components/ui/Navbar";             // Fixed top navigation bar
import SpaceScene from "@/components/layout/SpaceScene"; // Shared sky behind hero + assistant
import Hero from "@/components/sections/Hero";           // Full-screen hero
import AiAssistant from "@/components/sections/AiAssistant"; // AI assistant, directly below hero
import About from "@/components/sections/About";         // Company introduction + feature cards
import Products from "@/components/sections/Products";   // Industry domain showcase cards
import Mission from "@/components/sections/Mission";     // Mission statement + stats
import Founder from "@/components/sections/Founder";     // Team + Contact combined section
import OnboardingChecklist from "@/components/ui/OnboardingChecklist";

// -----------------------------------------------------------------------------
// Home Page Component (Server Component)
// Assembles the landing page by rendering sections in order.
// Each section has an id attribute for anchor-based navigation from the Navbar.
// The <main> element uses 'relative' positioning to support z-index stacking
// of the hero's 3D background and gradient overlays.
// -----------------------------------------------------------------------------
export default function Home() {
  return (
    <main className="relative">
      <Navbar />    {/* Sticky navigation — always visible at top */}
      {/* Hero and assistant share ONE continuous background, so the photograph
          and starfield run behind both instead of stopping at a hard line
          between them. */}
      <SpaceScene>
        <Hero />        {/* #hero — landing with logo, CTAs */}
        <AiAssistant /> {/* #assistant — ask about products, platform, roadmap */}
      </SpaceScene>
      <About />     {/* #about — AI-first, domain expertise, rapid innovation */}
      <Products />  {/* #products — Real Estate, HR, Healthcare cards */}
      <Mission />   {/* #mission — mission statement + stats */}
      <Founder />   {/* #contact — Team + Contact combined */}
      <OnboardingChecklist />
    </main>
  );
}
