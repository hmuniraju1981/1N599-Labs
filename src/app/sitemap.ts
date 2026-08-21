// =============================================================================
// FILE: src/app/sitemap.ts
// PURPOSE: Generates /sitemap.xml at build time.
//
// WHY: the site previously had no sitemap (verified: /sitemap.xml returned 404).
//      That was survivable while the whole site was one page, since the homepage
//      is trivially discoverable. It stops being survivable now that there are
//      five policy pages that nothing links to from outside the site — a search
//      engine has to crawl the footer to find them at all. Published policies
//      that cannot be found are not much use, and "is the privacy policy
//      accessible" is a question people do actually check.
//
// The `sitemap.ts` convention is a Route Handler that Next evaluates at build
// time, so it works under `output: "export"` and lands in out/sitemap.xml.
// =============================================================================

import type { MetadataRoute } from "next";
import { COMPANY, LEGAL_LAST_UPDATED_ISO, LEGAL_LINKS } from "@/lib/constants";

// REQUIRED under `output: "export"` in this version of Next. sitemap.ts compiles
// to a Route Handler, and the export build refuses to emit one unless it is
// explicitly declared static — it fails with:
//   Error: export const dynamic = "force-static" ... not configured on route
//   "/sitemap.xml" with "output: export"
// Nothing here reads request-time data, so forcing static is correct rather than
// a workaround.
export const dynamic = "force-static";

const BASE = `https://${COMPANY.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  // Build date. Fine for the homepage, whose content genuinely changes whenever
  // the site is rebuilt.
  const built = new Date();

  return [
    {
      url: BASE,
      lastModified: built,
      changeFrequency: "monthly",
      priority: 1,
    },
    // Derived from the same list the footer renders, so a new policy appears in
    // the sitemap automatically rather than being forgotten here.
    ...LEGAL_LINKS.map((link) => ({
      url: `${BASE}${link.href}`,
      // Policies are dated by when their *terms* last changed, not by when the
      // site was last deployed — see LEGAL_LAST_UPDATED in lib/constants.ts for
      // why those are deliberately different things. Re-dating a policy on every
      // unrelated deploy would tell crawlers it changed when it did not.
      lastModified: new Date(LEGAL_LAST_UPDATED_ISO),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
