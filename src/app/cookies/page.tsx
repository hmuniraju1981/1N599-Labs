// =============================================================================
// FILE: src/app/cookies/page.tsx
// PURPOSE: Cookie Policy (/cookies).
//
//          Optional PostHog analytics is loaded only after consent. Necessary
//          storage (this choice, and homepage onboarding progress) lives in
//          localStorage on this origin. Advertising pixels are not used.
//          Conversations are not stored. TheReelty is a separate origin and
//          does not share cookies with this site.
// =============================================================================

import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { A, Callout, Clause, LI, P, Term, UL } from "@/components/legal/prose";
import { COMPANY, legalLink } from "@/lib/constants";
import { ConsentControls } from "@/components/ui/CookieConsent";

const POLICY = legalLink("/cookies");

export const metadata: Metadata = {
  title: `${POLICY.title} | ${COMPANY.name}`,
  description: POLICY.description,
  alternates: { canonical: `https://${COMPANY.domain}/cookies` },
};

export default function CookiePolicy() {
  return (
    <LegalDocument
      title={POLICY.title}
      intro={`This policy explains our use of cookies and similar technologies on ${COMPANY.domain}, and how you control them.`}
    >
      <Callout>
        <p>
          <Term>The short version.</Term> We ask before running analytics. If you
          accept, PostHog may set cookies on this site and record page views plus
          five named events. If you choose essential only — or you never choose —
          those cookies are not set. We do not use advertising cookies.{" "}
          {COMPANY.productName} is a separate app and does not share cookies with
          this website.
        </p>
      </Callout>

      <Clause id="what-are-cookies" number={1} title="What cookies are">
        <P>
          A cookie is a small text file that a website asks your browser to store
          and send back on later visits. Cookies are used for genuinely necessary
          things — keeping you logged in, remembering a language choice — and also
          for tracking people across sites to target advertising. Related
          technologies such as <Term>localStorage</Term>, <Term>sessionStorage</Term>{" "}
          and tracking pixels do similar jobs by different means, and this policy
          covers those too.
        </P>
      </Clause>

      <Clause id="what-we-use" number={2} title="What this website uses">
        <P>
          <Term>Necessary (no consent required).</Term>
        </P>
        <UL>
          <LI>
            <Term>Your analytics choice.</Term> Stored in localStorage under{" "}
            <code className="text-cyan-300 text-sm">1n599-consent</code> so we
            remember whether you accepted or refused analytics and do not ask on
            every page load.
          </LI>
          <LI>
            <Term>Homepage getting-started progress.</Term> Stored in localStorage
            under <code className="text-cyan-300 text-sm">1n599-onboarding</code>{" "}
            so the five-step checklist can pick up where you left off. It is not
            used to identify you across sites.
          </LI>
          <LI>
            <Term>Cloudflare security cookies</Term> may appear in some
            circumstances — see section 3.
          </LI>
        </UL>
        <P>
          <Term>Analytics (consent required).</Term> If you click &ldquo;Accept
          analytics&rdquo;, we load PostHog from this site&rsquo;s own 1N599 Inc
          project. PostHog may then set first-party cookies and use localStorage
          on {COMPANY.domain} so it can tell returning browsers apart for
          measurement. It records page views and these events, in this order when
          you take the matching action: <Term>asked_assistant</Term>,{" "}
          <Term>explored_products</Term>, <Term>opened_the_reelty</Term>,{" "}
          <Term>sent_enquiry</Term>, <Term>shared_with_teammate</Term>. It does
          not receive assistant transcripts, contact-form contents, or advertising
          audiences.
        </P>
        <P>We do not use:</P>
        <UL>
          <LI>
            <Term>Advertising or targeting cookies.</Term> We run no advertising
            and no remarketing, and there are no third-party ad pixels on this
            site.
          </LI>
          <LI>
            <Term>Social media cookies.</Term> Links to social profiles are plain
            hyperlinks, not embedded widgets, so no social network is contacted
            until you actually click through.
          </LI>
          <LI>
            <Term>Session recording or conversation logging.</Term> The AI
            assistant conversation is held in the page&rsquo;s memory only and
            disappears when you close or reload the tab.
          </LI>
        </UL>
        <P>
          Web fonts are bundled into the site at build time and served from our own
          domain, so simply loading a page does not disclose your IP address to a
          font provider. PostHog is requested only after you accept analytics.
        </P>
        <P>
          {COMPANY.productName} at{" "}
          <A href={COMPANY.productUrl}>
            {COMPANY.productUrl.replace(/^https:\/\//, "")}
          </A>{" "}
          is a different origin. Opening it does not send this site&rsquo;s cookies
          there, and that product&rsquo;s cookies are not set on {COMPANY.domain}.
        </P>
      </Clause>

      <Clause id="infrastructure" number={3} title="Cookies our infrastructure may set">
        <P>
          This site is served through Cloudflare, which provides our hosting,
          network and security layer. Cloudflare may set{" "}
          <Term>strictly necessary</Term> cookies in some circumstances — for
          example a bot-management cookie such as{" "}
          <code className="text-cyan-300 text-sm">__cf_bm</code> — in order to tell
          automated traffic from real visitors and to protect the site from attack.
        </P>
        <P>
          These serve a security function, not a tracking one: they are not used to
          profile you, to build an advertising audience, or to follow you to other
          sites. Under both the GDPR and the ePrivacy rules, strictly necessary
          security cookies do not require consent. We do not control their
          behaviour; see{" "}
          <A href="https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/">
            Cloudflare&rsquo;s documentation on the cookies it sets
          </A>{" "}
          and its{" "}
          <A href="https://www.cloudflare.com/privacypolicy/">privacy policy</A>.
        </P>
      </Clause>

      <Clause id="consent" number={4} title="How we ask for consent">
        <P>
          Non-essential cookies — here, PostHog analytics — are off until you
          accept them. The banner on this site is that mechanism:{" "}
          <Term>Accept analytics</Term> loads PostHog; <Term>Essential only</Term>{" "}
          keeps it unloaded. There is no pre-ticked box, and closing the tab
          without choosing is treated as a refusal.
        </P>
        <P>
          You can change the choice on this page at any time:
        </P>
        <ConsentControls />
      </Clause>

      <Clause id="controlling" number={5} title="Controlling cookies yourself">
        <P>
          You can also block or delete cookies in your browser settings, and you
          can send a Global Privacy Control signal. Blocking cookies after you
          have accepted analytics will stop PostHog persisting an identifier, and
          blocking Cloudflare&rsquo;s security cookies may in some cases cause
          additional bot checks. Every major browser documents how to manage
          cookies in its help pages.
        </P>
      </Clause>

      <Clause id="contact" number={6} title="Contact">
        <P>
          Questions about this policy can go to{" "}
          <A href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</A>. See
          also our <A href="/privacy">Privacy Policy</A>, which covers the
          information we do receive.
        </P>
      </Clause>
    </LegalDocument>
  );
}
