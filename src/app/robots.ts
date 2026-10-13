// =============================================================================
// FILE: src/app/robots.ts
// PURPOSE: Generates /robots.txt at build time.
//
//          Same constraint as sitemap.ts: this convention compiles to a Route
//          Handler, and `output: "export"` refuses to emit one unless it is
//          explicitly static.
// =============================================================================

import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/constants";

export const dynamic = "force-static";

const BASE = `https://${COMPANY.domain}`;

// Search and AI crawlers, named explicitly so the intent is unambiguous. Training
// crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot) are
// allowed on purpose: the goal is for the company to be known to every LLM.
// They share one group with "*", so each gets the same /api/ exclusion — a bot
// matching its own group would otherwise ignore the "*" rules.
const CRAWLERS = [
  "Googlebot", "Bingbot", "Applebot", "DuckDuckBot",
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "CCBot",
  "*",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: CRAWLERS,
      allow: "/",
      // Pages Functions (assistant, contact form): POST-only, nothing to index.
      disallow: "/api/",
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
