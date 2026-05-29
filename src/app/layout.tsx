// =============================================================================
// FILE: src/app/layout.tsx
// PURPOSE: Root layout for the Next.js application. This is the top-level
//          server component that wraps all pages. It configures:
//          - Google Fonts (Geist Sans & Mono) via next/font
//          - HTML metadata for SEO and social sharing (OpenGraph)
//          - The global CSS import
//          - Dark mode class on <html> element
// =============================================================================

import type { Metadata } from "next";              // Next.js metadata type for SEO
import { Geist, Geist_Mono } from "next/font/google"; // Google Fonts with next/font optimization
import "./globals.css";                            // Global stylesheet import

// -----------------------------------------------------------------------------
// FONT CONFIGURATION
// next/font automatically optimizes fonts: self-hosts them, eliminates layout
// shift, and creates CSS variables for use in Tailwind/CSS.
// -----------------------------------------------------------------------------

// Geist Sans: primary body/UI font — clean, modern sans-serif
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS variable name (referenced in globals.css @theme)
  subsets: ["latin"],            // Only load Latin character subset (reduces file size)
});

// Geist Mono: monospace font for code/technical content
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // CSS variable name (referenced in globals.css @theme)
  subsets: ["latin"],            // Only load Latin character subset
});

// -----------------------------------------------------------------------------
// METADATA CONFIGURATION
// Defines the page title, description, keywords, and OpenGraph data.
// Next.js automatically generates <head> tags from this object.
// This improves SEO and social media link previews.
// -----------------------------------------------------------------------------
export const metadata: Metadata = {
  // Browser tab title
  title: "1N599 Labs | AI Solutions for Real Estate, HR & Healthcare",
  // Meta description for search engines (max ~160 chars recommended)
  description:
    "1N599 Labs builds intelligent AI products transforming Real Estate, HR, and Healthcare industries. For you always.",
  // SEO keywords (less impactful for modern Google but still used by other engines)
  keywords: [
    "AI",
    "artificial intelligence",
    "real estate AI",
    "HR technology",
    "healthcare AI",
    "1N599 Labs",
  ],
  // Author metadata
  authors: [{ name: "Harsha Muniraju" }],
  // Favicon configuration — points to the SVG favicon in /public
  icons: {
    icon: "/favicon.svg",
  },
  // OpenGraph metadata — controls how the site appears when shared on social media
  openGraph: {
    title: "1N599 Labs | Engineering Intelligence, Empowering Humanity", // Social share title
    description:
      "AI-powered solutions transforming Real Estate, HR, and Healthcare.", // Social share description
    url: "https://1n599labs.com",                   // Canonical URL
    siteName: "1N599 Labs",                         // Site name for social platforms
    type: "website",                                 // Content type (website, article, etc.)
  },
};

// -----------------------------------------------------------------------------
// ROOT LAYOUT COMPONENT
// This is a Server Component (no "use client" directive).
// It renders the <html> and <body> tags that wrap all page content.
// The 'children' prop receives the current page's content.
// -----------------------------------------------------------------------------
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // The page content rendered inside this layout
}>) {
  return (
    // <html> element with:
    //   - lang="en" for accessibility (screen readers)
    //   - Font CSS variable classes (makes fonts available via var())
    //   - h-full: ensures HTML takes full viewport height
    //   - antialiased: enables font smoothing
    //   - dark: forces dark mode class (Tailwind dark: variants always active)
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      {/* <body> with:
          - min-h-full: ensures body fills at least the full viewport
          - flex flex-col: allows children to use flex-grow for full-height layouts
          - bg/text colors: fallback dark theme colors (matches CSS custom props) */}
      <body className="min-h-full flex flex-col bg-[#030712] text-[#f1f5f9]">
        {children} {/* Current page content renders here */}
      </body>
    </html>
  );
}
