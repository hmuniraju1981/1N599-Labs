// =============================================================================
// FILE: src/app/acceptable-use/page.tsx
// PURPOSE: Acceptable Use Policy (/acceptable-use).
//
// This is the policy the rate limiters and the same-origin check in
// functions/api/ actually enforce, so the prohibitions here are written to match
// the controls that exist rather than to be aspirational.
// =============================================================================

import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { A, Clause, LI, P, SubHeading, Term, UL } from "@/components/legal/prose";
import { COMPANY, legalLink } from "@/lib/constants";

const POLICY = legalLink("/acceptable-use");

export const metadata: Metadata = {
  title: `${POLICY.title} | ${COMPANY.name}`,
  description: POLICY.description,
  alternates: { canonical: `https://${COMPANY.domain}/acceptable-use` },
};

export default function AcceptableUsePolicy() {
  return (
    <LegalDocument
      title={POLICY.title}
      intro={`This policy sets out what you may not do when using ${COMPANY.domain}, its AI assistant, its contact form and its APIs. It forms part of our Terms of Service.`}
    >
      <Clause id="scope" number={1} title="Scope">
        <P>
          This policy applies to everyone who accesses this website or the services
          on it. It is incorporated into our{" "}
          <A href="/terms">Terms of Service</A>, so breaching this policy is a
          breach of those terms.
        </P>
      </Clause>

      <Clause id="prohibited" number={2} title="Prohibited conduct">
        <P>You must not:</P>

        <SubHeading>Unlawful and harmful use</SubHeading>
        <UL>
          <LI>
            use this website for any unlawful purpose, or to facilitate any unlawful
            activity;
          </LI>
          <LI>
            infringe anyone&rsquo;s intellectual property, privacy, publicity or
            other rights;
          </LI>
          <LI>
            transmit anything defamatory, harassing, abusive, threatening, obscene,
            hateful, or that constitutes or promotes discrimination or violence;
          </LI>
          <LI>
            impersonate any person or organisation, or misrepresent your affiliation
            with one — including submitting a contact form under someone
            else&rsquo;s email address;
          </LI>
          <LI>
            upload or transmit any virus, worm, logic bomb or other malicious code.
          </LI>
        </UL>

        <SubHeading>Attacks on the service</SubHeading>
        <UL>
          <LI>
            attempt to gain unauthorised access to this website, its APIs, its
            hosting environment, or any account, system or network connected to it;
          </LI>
          <LI>
            probe, scan or test the vulnerability of the site, or breach or
            circumvent any security or authentication measure — including the
            same-origin checks and rate limits on our API endpoints;
          </LI>
          <LI>
            interfere with or disrupt the site, for example by denial-of-service or
            distributed denial-of-service attack, or by flooding it with requests;
          </LI>
          <LI>
            place an unreasonable load on our infrastructure, or attempt to consume
            our third-party API quotas — the AI assistant is provided for genuine
            enquiries about our business, and its cost is borne by us.
          </LI>
        </UL>

        <SubHeading>Automated and extractive use</SubHeading>
        <UL>
          <LI>
            use any robot, spider, scraper or other automated means to access the
            site or its APIs, except that well-behaved search engine crawlers
            obeying our <code className="text-cyan-300 text-sm">robots.txt</code>{" "}
            are welcome;
          </LI>
          <LI>
            call our API endpoints from outside this website, embed them in another
            application, or resell or redistribute access to them;
          </LI>
          <LI>
            use the AI assistant to extract, replicate or reverse engineer our
            system prompt, our underlying model configuration, or the workings of
            our products;
          </LI>
          <LI>
            use output from the AI assistant to train, fine-tune or evaluate another
            machine learning model;
          </LI>
          <LI>
            harvest email addresses or other contact information from the site,
            including for unsolicited marketing.
          </LI>
        </UL>

        <SubHeading>Misuse of the AI assistant and the contact form</SubHeading>
        <UL>
          <LI>
            submit prompts designed to make the assistant produce unlawful, harmful,
            deceptive or sexually explicit content, or to bypass its instructions;
          </LI>
          <LI>
            submit other people&rsquo;s personal information, confidential
            information, credentials, payment details or health information;
          </LI>
          <LI>
            use the contact form to send spam, chain messages, phishing attempts,
            unsolicited commercial offers or bulk automated submissions.
          </LI>
        </UL>
      </Clause>

      <Clause id="fair-use" number={3} title="Fair use and rate limits">
        <P>
          We apply automated rate limits to protect the service and our costs. At
          present the AI assistant permits 20 messages per 10 minutes and the
          contact form 5 submissions per hour, measured per network address. These
          figures are generous for genuine use and may change without notice.
        </P>
        <P>
          If you hit a limit you will be told so and asked to wait. Deliberately
          working around a rate limit — by rotating addresses, for instance — is a
          breach of this policy.
        </P>
      </Clause>

      <Clause id="reporting" number={4} title="Reporting problems">
        <P>
          If you find a security vulnerability, please report it privately to{" "}
          <A href={`mailto:${COMPANY.securityEmail}`}>{COMPANY.securityEmail}</A>{" "}
          and give us a reasonable opportunity to fix it before disclosing it
          publicly. Please do not access, modify or delete other people&rsquo;s data,
          degrade the service, or run automated scanning at volume while
          investigating. We will not pursue action against good-faith research that
          respects those boundaries.
        </P>
        <P>
          To report abuse or content that breaches this policy, contact{" "}
          <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A>.
        </P>
      </Clause>

      <Clause id="enforcement" number={5} title="Enforcement">
        <P>
          We may investigate suspected breaches and take any action we consider
          appropriate, including:
        </P>
        <UL>
          <LI>
            <Term>blocking or throttling</Term> your access to the site or specific
            endpoints, with or without notice;
          </LI>
          <LI>
            <Term>removing or refusing</Term> any submission;
          </LI>
          <LI>
            <Term>preserving and disclosing information</Term> to law enforcement
            where we believe it is required by law or necessary to prevent harm;
          </LI>
          <LI>
            <Term>pursuing legal remedies</Term>, including injunctive relief and
            recovery of costs, for conduct that damages us or our users.
          </LI>
        </UL>
        <P>
          The conduct listed in this policy is not exhaustive. We may act against
          anything that harms this service, its users, or third parties, whether or
          not it is specifically named above.
        </P>
      </Clause>

      <Clause id="changes" number={6} title="Changes">
        <P>
          We may update this policy as circumstances require. The &ldquo;last
          updated&rdquo; date at the top of this page reflects the current version,
          and changes take effect when published.
        </P>
      </Clause>
    </LegalDocument>
  );
}
