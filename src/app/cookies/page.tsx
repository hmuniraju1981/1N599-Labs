// =============================================================================
// FILE: src/app/cookies/page.tsx
// PURPOSE: Cookie Policy (/cookies).
//
// WHY THIS PAGE SAYS "WE SET NO COOKIES" RATHER THAN LISTING A TABLE OF THEM:
//          because that is the truth, and it was verified rather than assumed.
//          The live site returns no Set-Cookie header on the document or on
//          /api/*, there is no analytics or advertising code in the bundle, and
//          next/font self-hosts the webfonts at build time so there is no
//          third-party request on page load.
//
//          The consequence, stated in section 4, is that no consent banner is
//          required. Publishing a boilerplate cookie policy that describes
//          analytics cookies this site does not set — and then adding a banner to
//          ask permission for them — would be actively misleading. If tracking is
//          ever added, this page and a consent mechanism must both change first.
// =============================================================================

import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { A, Callout, Clause, LI, P, Term, UL } from "@/components/legal/prose";
import { COMPANY, legalLink } from "@/lib/constants";

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
      intro={`This policy explains our use of cookies and similar technologies on ${COMPANY.domain}. It is short, because we do not use them for tracking.`}
    >
      <Callout>
        <p>
          <Term>The short version.</Term> This website sets no cookies of its own.
          It runs no analytics, no advertising and no tracking technology, so there
          is nothing here to consent to and no cookie banner to dismiss.
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
          Nothing. Specifically, we do not use:
        </P>
        <UL>
          <LI>
            <Term>Analytics or measurement cookies.</Term> There is no Google
            Analytics, no tag manager, and no privacy-preserving analytics product
            either. We do not measure visits.
          </LI>
          <LI>
            <Term>Advertising or targeting cookies.</Term> We run no advertising and
            no remarketing, and there are no third-party ad pixels on this site.
          </LI>
          <LI>
            <Term>Social media cookies.</Term> Links to social profiles are plain
            hyperlinks, not embedded widgets, so no social network is contacted
            until you actually click through.
          </LI>
          <LI>
            <Term>Preference cookies.</Term> There is nothing to remember: the site
            has no accounts, and no theme or language switcher.
          </LI>
          <LI>
            <Term>Client-side storage for tracking.</Term> We do not write to
            localStorage or sessionStorage to identify you. Your AI assistant
            conversation is held in the page&rsquo;s memory only and disappears when
            you close or reload the tab.
          </LI>
        </UL>
        <P>
          Web fonts are bundled into the site at build time and served from our own
          domain, so simply loading a page does not disclose your IP address to a
          font provider.
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
        <P>
          At the time this policy was last updated, no such cookie was observed on
          normal page loads of this site.
        </P>
      </Clause>

      <Clause id="consent" number={4} title="Why there is no cookie banner">
        <P>
          Consent is required for cookies that are not strictly necessary. Because
          we set none of those, there is nothing for you to agree to, and a banner
          would be theatre — it would ask permission for tracking that does not
          exist while adding a click to every visit.
        </P>
        <P>
          If we ever introduce analytics or any other non-essential technology, we
          will update this policy and put a genuine consent mechanism in place
          before doing so, not after.
        </P>
      </Clause>

      <Clause id="controlling" number={5} title="Controlling cookies yourself">
        <P>
          You can block or delete cookies in your browser settings, and you can send
          a &ldquo;Do Not Track&rdquo; or Global Privacy Control signal. Since we do
          no tracking, these settings will not change anything about how this site
          behaves — but blocking Cloudflare&rsquo;s security cookies may in some
          cases cause additional bot checks. Every major browser documents how to
          manage cookies in its help pages.
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
