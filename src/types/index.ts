// =============================================================================
// FILE: src/types/index.ts
// PURPOSE: Central type definitions for the 1N599 Labs application.
//          All shared TypeScript interfaces and types are declared here
//          to maintain a single source of truth for data shapes.
// =============================================================================

// -----------------------------------------------------------------------------
// Navigation link type used in the Navbar component
// -----------------------------------------------------------------------------
export interface NavLink {
  href: string;   // The anchor or route the link navigates to
  label: string;  // The display text shown in the navigation
}

// -----------------------------------------------------------------------------
// Feature card type used in the About section
// -----------------------------------------------------------------------------
export interface Feature {
  icon: React.ReactNode; // The Lucide icon component to render
  title: string;         // Heading text for the feature card
  desc: string;          // Description paragraph for the feature card
}

// -----------------------------------------------------------------------------
// Product domain card type used in the Products section
// -----------------------------------------------------------------------------
export interface Product {
  icon: React.ReactNode;   // The Lucide icon component to render
  domain: string;          // Industry vertical label (e.g., "Real Estate")
  title: string;           // Product card heading
  description: string;     // Detailed description of the product offering
  gradient: string;        // Tailwind gradient classes for styling
  accentColor: string;     // Tailwind text color class for accent elements
  bgAccent: string;        // Tailwind gradient classes for background accent
}

// -----------------------------------------------------------------------------
// Stat item type used in the Mission section
// -----------------------------------------------------------------------------
export interface Stat {
  number: string; // The value or symbol to display prominently
  label: string;  // Description label below the number
}

// -----------------------------------------------------------------------------
// Social link type used in the Founder section
// -----------------------------------------------------------------------------
export interface SocialLink {
  href: string;          // URL the social link points to
  label: string;        // Accessible label for the link
  icon: React.ReactNode; // SVG or icon component to render
}

// -----------------------------------------------------------------------------
// Logo component props
// -----------------------------------------------------------------------------
export interface LogoProps {
  size?: number;      // Width and height of the SVG in pixels (default: 48)
  showText?: boolean; // Whether to display the "1N599 Labs" text beside the logo
}
