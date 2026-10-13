// =============================================================================
// FILE: src/lib/seo.ts
// PURPOSE: Search/AI-discovery helpers: per-policy <head> metadata and the
//          Organization/WebSite JSON-LD rendered on the homepage.
//
// Every fact here comes from COMPANY / LEGAL_LINKS. Do not add ratings, counts
// or profiles that are not real — structured data is read as a claim.
// =============================================================================

import type { Metadata } from "next";
import { COMPANY, legalLink } from "@/lib/constants";

export const SITE_URL = `https://${COMPANY.domain}`;
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

// Without its own openGraph/twitter, a policy page inherited the homepage's
// (metadata merges shallowly), so a shared /privacy link previewed as the home
// page with og:url pointing home.
export function legalMetadata(href: string): Metadata {
  const { title, description } = legalLink(href);
  const url = `${SITE_URL}${href}`;
  const fullTitle = `${title} | ${COMPANY.name}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: COMPANY.name,
      type: "website",
      locale: "en_US",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: COMPANY.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}

const ORG_ID = `${SITE_URL}/#organization`;
const { address, founder } = COMPANY;

export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: COMPANY.name,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      image: OG_IMAGE,
      description:
        "1N599 Inc is a product-based AI company with a real estate product, building and customizing intelligent products for opportunities in any industry.",
      slogan: COMPANY.mission,
      email: COMPANY.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${address.street} ${address.suite}`,
        addressLocality: address.city,
        addressRegion: address.state,
        postalCode: address.zip,
        addressCountry: "US",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: COMPANY.email,
      },
      founder: {
        "@type": "Person",
        name: founder.name,
        jobTitle: founder.title,
        // Only the profile verified to be this person. githubUrl in COMPANY
        // resolves to a different user, so it is deliberately left out.
        sameAs: [founder.resumeUrl],
      },
      owns: {
        "@type": "SoftwareApplication",
        name: COMPANY.productName,
        url: COMPANY.productUrl,
        applicationCategory: "BusinessApplication",
        description:
          "AI-powered real estate product that supports property workflows, insights and decisions for industry professionals.",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: COMPANY.name,
      publisher: { "@id": ORG_ID },
      inLanguage: "en-US",
    },
  ],
};
