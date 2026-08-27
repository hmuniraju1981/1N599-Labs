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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
