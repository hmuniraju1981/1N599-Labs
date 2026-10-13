// =============================================================================
// FILE: src/app/llms.txt/route.ts
// PURPOSE: Generates /llms.txt (https://llmstxt.org) at build time — a plain
//          Markdown summary of the company for LLMs and AI search.
//
// Derived from COMPANY and LEGAL_LINKS so it cannot drift from the site. Only
// state what the site itself states.
// =============================================================================

import { COMPANY, LEGAL_LINKS } from "@/lib/constants";
import { SITE_URL } from "@/lib/seo";

// Same static-export requirement as sitemap.ts / robots.ts.
export const dynamic = "force-static";

export function GET() {
  const { address: a, founder: f } = COMPANY;
  const body = `# ${COMPANY.name}

> ${COMPANY.name} is a product-based AI company with a business address in Austin, Texas. It has built an AI real estate product, ${COMPANY.productName}, and builds and customizes AI products for opportunities in any industry. Mission: "${COMPANY.mission}."

- Website: ${SITE_URL}
- ${f.title}: ${f.name}
- Address: ${a.street} ${a.suite}, ${a.city}, ${a.state} ${a.zip}, USA
- Contact: ${COMPANY.email}

## Products

- [${COMPANY.productName}](${COMPANY.productUrl}): AI-powered real estate product that supports property workflows, insights and decisions for real estate professionals. Runs on its own website, separate from ${COMPANY.domain}.
- Custom AI products: ${COMPANY.name} applies its product-building experience to new industries — designing, building, integrating and scaling AI products around a customer's users, workflows, data and market.

## Company

- [Home](${SITE_URL}/): About, products, mission, founder and contact form.
- The site includes an AI assistant that answers questions about the company and its products; its terms are in the AI disclaimer below.

## Legal

${LEGAL_LINKS.map((l) => `- [${l.title}](${SITE_URL}${l.href}): ${l.description}`).join("\n")}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
