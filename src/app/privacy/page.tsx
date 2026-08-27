// =============================================================================
// FILE: src/app/privacy/page.tsx
// PURPOSE: Privacy Policy (/privacy).
//
// ACCURACY NOTE: every factual claim below was checked against what this site
//          actually does, rather than copied from a template. Specifically:
//          - Optional PostHog analytics runs only after the visitor consents.
//            Without consent (or without NEXT_PUBLIC_POSTHOG_KEY at build time)
//            no analytics cookies are set and no PostHog request is made.
//          - Assistant conversations are not stored by us and are not sent to
//            PostHog. Advertising pixels and session recording are not used.
//          - Fonts are self-hosted by next/font at build time, so there is no
//            runtime request to Google Fonts and no IP disclosure to Google.
//          - Processors that may receive personal data: Cloudflare (hosting,
//            mail), Groq (assistant inference), and PostHog (analytics, only
//            with consent).
//          A privacy policy that overstates collection is as much a compliance
//          problem as one that understates it, so this stays in sync with the
//          code. If data handling changes, this page changes with it.
// =============================================================================

import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import {
  A,
  Callout,
  Clause,
  Definition,
  DefinitionList,
  LI,
  P,
  SubHeading,
  Term,
  UL,
} from "@/components/legal/prose";
import { COMPANY, legalLink } from "@/lib/constants";

const POLICY = legalLink("/privacy");

export const metadata: Metadata = {
  title: `${POLICY.title} | ${COMPANY.name}`,
  description: POLICY.description,
  alternates: { canonical: `https://${COMPANY.domain}/privacy` },
};

export default function PrivacyPolicy() {
  return (
    <LegalDocument
      title={POLICY.title}
      intro={`This policy explains what personal information ${COMPANY.name} collects through this website, why we collect it, who we share it with, and the choices and rights you have. We have written it to describe what this site actually does, in plain terms.`}
    >
      <Callout>
        <p>
          <Term>The short version.</Term> We only receive personal information when
          you choose to send it (a contact-form message, or whatever you type into
          the AI assistant), plus optional analytics if you accept the cookie
          banner. Analytics is PostHog; it records page views and five named
          events — <Term>asked_assistant</Term>, <Term>explored_products</Term>,{" "}
          <Term>opened_the_reelty</Term>, <Term>sent_enquiry</Term>,{" "}
          <Term>shared_with_teammate</Term> — and it does not receive the contents
          of your assistant conversation. We do not use advertising pixels, we do
          not sell personal information, and we never use it to build advertising
          profiles. Our product app, {COMPANY.productName}, is a separate site at{" "}
          {COMPANY.productUrl.replace(/^https:\/\//, "")} and does not share cookies
          with this one.
        </p>
      </Callout>

      <Clause id="who-we-are" number={1} title="Who we are">
        <P>
          {COMPANY.name} (&ldquo;<Term>we</Term>&rdquo;, &ldquo;<Term>us</Term>
          &rdquo;, &ldquo;<Term>our</Term>&rdquo;) is a company incorporated in the
          United States, with its registered address at:
        </P>
        <P>
          <span style={{ whiteSpace: "pre-line" }}>{COMPANY.address.full}</span>
          <br />
          United States
        </P>
        <P>
          For anything in this policy, including requests about your data, contact
          us at <A href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</A>
          . We are the data controller for the personal information described here.
        </P>
      </Clause>

      <Clause id="what-we-collect" number={2} title="Information we collect">
        <P>
          We collect very little, and almost all of it is information you type in
          deliberately. There is no account system on this website and nothing to
          sign up for.
        </P>

        <DefinitionList>
          <Definition term="Contact form submissions">
            When you use the &ldquo;Send a Message&rdquo; form, we receive the email
            address and message you enter, and your name if you choose to provide
            it (the name field is optional). We need your email address in order to
            reply — that is the only reason it is requested.
          </Definition>

          <Definition term="AI assistant conversations">
            The messages you send to the AI assistant, and the replies it generates,
            are transmitted to our inference provider in order to produce an answer.
            Please do not enter sensitive personal information, confidential
            business information, credentials or anything you would not want
            processed by a third-party AI service. See our{" "}
            <A href="/ai-disclaimer">AI Assistant Terms &amp; Disclaimer</A>.
          </Definition>

          <Definition term="Optional analytics (PostHog)">
            If you accept analytics on the cookie banner, we load PostHog in your
            browser. It then records that you visited a page on this site, and may
            record these five events when you take the matching action:{" "}
            <Term>asked_assistant</Term> (you send a message to the assistant),{" "}
            <Term>explored_products</Term> (the products section comes into view),{" "}
            <Term>opened_the_reelty</Term> (you open {COMPANY.productName}),{" "}
            <Term>sent_enquiry</Term> (the contact form is accepted), and{" "}
            <Term>shared_with_teammate</Term> (you use the share control). The
            event is a name only — we do not attach the text of your question, your
            email, or your message. If you choose &ldquo;Essential only&rdquo;, or
            you never decide, PostHog is not loaded and these events are not sent.
          </Definition>

          <Definition term="Consent and onboarding storage">
            Your analytics choice is kept in localStorage on this device under the
            key <code className="text-cyan-300 text-sm">1n599-consent</code>. On the
            homepage, a getting-started checklist stores which of the five steps
            you have finished under{" "}
            <code className="text-cyan-300 text-sm">1n599-onboarding</code>. That
            progress stays in your browser; we do not read it on the server.
          </Definition>

          <Definition term="Abuse-prevention data">
            To stop automated abuse of the assistant and the contact form, we
            briefly record a <Term>shortened</Term> form of your IP address
            alongside request timestamps. IPv4 addresses are used in full; IPv6
            addresses are truncated to their network prefix. This is stored in
            temporary key-value storage that automatically deletes itself after the
            rate-limit window elapses — 10 minutes for the assistant, 1 hour for the
            contact form. It is never combined with your submissions, and it is not
            used to identify or profile you.
          </Definition>

          <Definition term="Server and security logs">
            Our hosting and network provider, Cloudflare, processes standard request
            metadata — IP address, timestamp, requested URL, user agent, and similar
            — in order to serve the site, route traffic, and protect against
            attacks. This is a normal and unavoidable part of how any website
            operates. These logs are held by Cloudflare under its own retention
            schedule and we do not maintain a separate copy or use them for
            analytics.
          </Definition>
        </DefinitionList>

        <SubHeading>What we do not collect</SubHeading>
        <UL>
          <LI>
            No advertising pixels, tag managers, or cross-site remarketing. Links
            to other sites are ordinary hyperlinks.
          </LI>
          <LI>
            No session recording, heatmapping, or conversation logging. Assistant
            messages are not written to our servers and are not sent to PostHog.
          </LI>
          <LI>
            No analytics unless you accept it. Rejecting the banner, or leaving it
            unanswered, leaves PostHog unloaded.
          </LI>
          <LI>
            No third-party font, script or media requests at page load. Web fonts
            are bundled with the site at build time. PostHog is requested only
            after analytics consent.
          </LI>
          <LI>
            No special category data, biometric data, precise geolocation, or
            payment card data. This website takes no payments.
          </LI>
        </UL>
      </Clause>

      <Clause id="why-we-use-it" number={3} title="Why we use your information">
        <P>
          We use personal information only for the purposes it was provided for:
        </P>
        <UL>
          <LI>
            <Term>To respond to you.</Term> If you send a message, we use your
            email address and message to reply and to continue that conversation.
          </LI>
          <LI>
            <Term>To operate the AI assistant.</Term> Your messages are processed
            in order to generate a response to them.
          </LI>
          <LI>
            <Term>To keep the site secure and available.</Term> Rate limiting,
            spam filtering and abuse prevention.
          </LI>
          <LI>
            <Term>To understand how this landing site is used</Term> — only if you
            accept analytics. We use that to see whether people find the assistant,
            the products, {COMPANY.productName}, the contact form, and the share
            control.
          </LI>
          <LI>
            <Term>To comply with law</Term> where we are legally required to
            retain or produce information.
          </LI>
        </UL>
        <P>
          We do not use your information for automated decision-making that has a
          legal or similarly significant effect on you, and we do not use it for
          marketing unless you have asked us to contact you.
        </P>

        <SubHeading>Legal bases (for individuals in the UK, EU and EEA)</SubHeading>
        <UL>
          <LI>
            <Term>Legitimate interests</Term> — responding to enquiries you send
            us, and keeping our website secure and functional.
          </LI>
          <LI>
            <Term>Consent</Term> — where you voluntarily submit information
            through the contact form or the assistant, and for optional analytics
            cookies and similar storage. You can withdraw contact-form consent by
            asking us to delete what you sent, and you can withdraw analytics
            consent at any time on the{" "}
            <A href="/cookies">Cookie Policy</A> page.
          </LI>
          <LI>
            <Term>Legal obligation</Term> — where retention or disclosure is
            required by applicable law.
          </LI>
        </UL>
      </Clause>

      <Clause id="sharing" number={4} title="Who we share information with">
        <P>
          We do not sell personal information, we do not share it for
          cross-context behavioural advertising, and we do not disclose it to data
          brokers. We use a small number of service providers
          (&ldquo;processors&rdquo;) who handle data strictly on our instructions:
        </P>

        <DefinitionList>
          <Definition term="Cloudflare, Inc. — hosting, network security and email delivery">
            Serves this website, provides the serverless compute behind the
            assistant and the contact form, stores the temporary rate-limit
            counters, and delivers contact-form messages to our inbox. See{" "}
            <A href="https://www.cloudflare.com/privacypolicy/">
              Cloudflare&rsquo;s privacy policy
            </A>
            .
          </Definition>

          <Definition term="Groq, Inc. — AI inference">
            Receives the contents of your AI assistant conversation in order to
            generate a reply. Your IP address and identity are not sent — the
            request is made by our server, not your browser. See{" "}
            <A href="https://groq.com/privacy-policy/">Groq&rsquo;s privacy policy</A>
            .
          </Definition>

          <Definition term="PostHog, Inc. — product analytics (only with consent)">
            If you accept analytics, your browser loads PostHog and sends it page
            views and the five events named in section 2. PostHog is a processor
            acting on our instructions for this website. It is not loaded if you
            refuse, and it is not sent assistant transcripts or contact-form
            contents. See{" "}
            <A href="https://posthog.com/privacy">PostHog&rsquo;s privacy policy</A>.
          </Definition>
        </DefinitionList>

        <P>
          {COMPANY.productName} at{" "}
          <A href={COMPANY.productUrl}>{COMPANY.productUrl.replace(/^https:\/\//, "")}</A>{" "}
          is a separate product on a separate origin. This website does not share
          cookies, localStorage or consent with it. Use of {COMPANY.productName} is
          governed by that product&rsquo;s own terms and privacy notice, not by this
          page.
        </P>

        <P>
          We may also disclose information where we are legally compelled to (for
          example, in response to a valid legal process), where necessary to
          protect our rights or the safety of others, or to professional advisers
          under a duty of confidentiality. If our business is ever involved in a
          merger, acquisition or asset sale, information may transfer as part of
          that transaction; we would update this policy if that happened.
        </P>
      </Clause>

      <Clause id="retention" number={5} title="How long we keep it">
        <UL>
          <LI>
            <Term>Contact-form messages</Term> are kept in our email system for as
            long as needed to handle your enquiry and to keep a record of our
            correspondence, and are then deleted. You can ask us to delete them
            sooner.
          </LI>
          <LI>
            <Term>AI assistant conversations</Term> are not stored on our servers.
            The conversation exists only in your browser for the length of your
            visit and is gone when you close or reload the page. Our inference
            provider may retain the request transiently for abuse monitoring under
            its own terms. We do not send those messages to PostHog.
          </LI>
          <LI>
            <Term>Analytics events</Term>, if you consented, are retained in our
            PostHog project according to that project&rsquo;s retention settings,
            and you can stop further collection at any time from the{" "}
            <A href="/cookies">Cookie Policy</A>.
          </LI>
          <LI>
            <Term>Consent and onboarding records</Term> stay in your browser until
            you clear site data for {COMPANY.domain}.
          </LI>
          <LI>
            <Term>Rate-limit records</Term> expire automatically within 10 minutes
            (assistant) or 1 hour (contact form).
          </LI>
          <LI>
            <Term>Server and security logs</Term> are retained by Cloudflare
            according to its own retention periods.
          </LI>
        </UL>
      </Clause>

      <Clause id="security" number={6} title="How we protect it">
        <P>
          The site is served only over encrypted HTTPS connections, and data in
          transit to our processors is encrypted. API credentials are held as
          encrypted secrets in our hosting environment and are never exposed to
          your browser. The contact-form endpoint validates and rate-limits every
          submission, and the component that sends mail is restricted so that it
          can only ever deliver to our own inbox.
        </P>
        <P>
          No system is perfectly secure, and we cannot guarantee absolute security.
          If you believe you have found a vulnerability, please report it to{" "}
          <A href={`mailto:${COMPANY.securityEmail}`}>{COMPANY.securityEmail}</A>{" "}
          and give us a reasonable opportunity to fix it before disclosing it
          publicly.
        </P>
      </Clause>

      <Clause id="transfers" number={7} title="International data transfers">
        <P>
          We are based in the United States and our processors operate global
          infrastructure, so information you send us will be processed in the United
          States and potentially in other countries. If you are in the UK, EU or
          EEA, this means your information may be transferred outside your home
          jurisdiction. Where such transfers occur, they are made under appropriate
          safeguards, such as the European Commission&rsquo;s Standard Contractual
          Clauses, as implemented in our providers&rsquo; data processing terms.
        </P>
      </Clause>

      <Clause id="your-rights" number={8} title="Your rights and choices">
        <P>
          Depending on where you live, you may have some or all of the following
          rights over your personal information:
        </P>
        <UL>
          <LI>
            <Term>Access</Term> — ask what personal information we hold about you
            and receive a copy.
          </LI>
          <LI>
            <Term>Correction</Term> — have inaccurate information corrected.
          </LI>
          <LI>
            <Term>Deletion</Term> — ask us to delete information we hold about
            you.
          </LI>
          <LI>
            <Term>Portability</Term> — receive your information in a portable
            format.
          </LI>
          <LI>
            <Term>Objection and restriction</Term> — object to, or ask us to
            restrict, processing based on our legitimate interests.
          </LI>
          <LI>
            <Term>Withdraw consent</Term> — where we rely on consent, withdraw it
            at any time.
          </LI>
          <LI>
            <Term>Non-discrimination</Term> — we will not treat you differently
            for exercising any of these rights.
          </LI>
        </UL>

        <P>
          To exercise any of these, email{" "}
          <A href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</A>.
          We will respond within the time required by applicable law — generally 30
          days, and within 45 days for requests under California and Texas law,
          extendable where permitted. We may need to verify your identity before
          acting, which for a website with no accounts usually means confirming
          control of the email address involved. You may use an authorised agent
          where the law allows it.
        </P>

        <SubHeading>California residents (CCPA/CPRA)</SubHeading>
        <P>
          We have not sold personal information, and we have not shared personal
          information for cross-context behavioural advertising, in the preceding
          12 months. We do not knowingly sell or share the personal information of
          consumers under 16. The categories of personal information we collect are
          identifiers (email address, name, IP address) and internet activity
          information (request metadata, and — only with your consent — page views
          and the five analytics events named in section 2), together with the
          contents of communications you choose to send us, as described in section
          2. We do not use or disclose sensitive personal information for purposes
          requiring a right to limit.
        </P>

        <SubHeading>Texas, and other US state privacy laws</SubHeading>
        <P>
          If you are a resident of Texas or another state with a comprehensive
          consumer privacy law, you have rights of access, correction, deletion and
          portability as described above, and the right to opt out of targeted
          advertising, sale of personal data, and certain profiling. We do not
          engage in any of those three activities. Where an appeal mechanism is
          required and we decline your request, you may appeal by replying to our
          decision; we will respond in writing within the statutory period.
        </P>

        <SubHeading>UK, EU and EEA residents</SubHeading>
        <P>
          You also have the right to lodge a complaint with your local supervisory
          authority. We would appreciate the chance to address your concern
          directly first.
        </P>
      </Clause>

      <Clause id="children" number={9} title="Children’s privacy">
        <P>
          This website is intended for a business audience and is not directed at
          children. We do not knowingly collect personal information from children
          under 16. If you believe a child has provided us with personal
          information, contact us and we will delete it.
        </P>
      </Clause>

      <Clause id="changes" number={10} title="Changes to this policy">
        <P>
          We may update this policy as the website or the law changes. The
          &ldquo;last updated&rdquo; date at the top of this page always reflects
          the current version. If we make a material change to how we handle
          personal information, we will make that clear on this page rather than
          changing it quietly.
        </P>
      </Clause>

      <Clause id="contact" number={11} title="Contact us">
        <P>
          Questions, requests or complaints about privacy can go to{" "}
          <A href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</A>, or
          by post to {COMPANY.name}, {COMPANY.address.street}{" "}
          {COMPANY.address.suite}, {COMPANY.address.city}, {COMPANY.address.state}{" "}
          {COMPANY.address.zip}, United States.
        </P>
      </Clause>
    </LegalDocument>
  );
}
