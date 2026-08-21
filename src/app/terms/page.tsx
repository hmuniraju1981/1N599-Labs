// =============================================================================
// FILE: src/app/terms/page.tsx
// PURPOSE: Terms of Service (/terms).
//
// SCOPE NOTE: these terms cover the *website* and the AI assistant on it. They
//          deliberately do not attempt to cover commercial product agreements —
//          a customer buying or licensing a 1N599 product signs a separate
//          contract, and a website ToS that pretends to govern paid engagements
//          creates conflicts with the real agreement rather than protecting
//          anyone. Section 3 says so explicitly.
// =============================================================================

import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { A, Callout, Clause, LI, P, SubHeading, Term, UL } from "@/components/legal/prose";
import { COMPANY, legalLink } from "@/lib/constants";

const POLICY = legalLink("/terms");

export const metadata: Metadata = {
  title: `${POLICY.title} | ${COMPANY.name}`,
  description: POLICY.description,
  alternates: { canonical: `https://${COMPANY.domain}/terms` },
};

export default function TermsOfService() {
  return (
    <LegalDocument
      title={POLICY.title}
      intro={`These terms govern your use of the ${COMPANY.domain} website and the AI assistant available on it. By using this website, you agree to them. If you do not agree, please do not use the site.`}
    >
      <Clause id="about" number={1} title="These terms, and who they are with">
        <P>
          This website is operated by {COMPANY.name}, a company incorporated in the
          United States with its registered address at {COMPANY.address.street}{" "}
          {COMPANY.address.suite}, {COMPANY.address.city}, {COMPANY.address.state}{" "}
          {COMPANY.address.zip}, United States (&ldquo;<Term>we</Term>&rdquo;,
          &ldquo;<Term>us</Term>&rdquo;, &ldquo;<Term>our</Term>&rdquo;). &ldquo;
          <Term>You</Term>&rdquo; means anyone accessing the site.
        </P>
        <P>
          These terms incorporate our{" "}
          <A href="/acceptable-use">Acceptable Use Policy</A>, our{" "}
          <A href="/ai-disclaimer">AI Assistant Terms &amp; Disclaimer</A>, and our{" "}
          <A href="/cookies">Cookie Policy</A>. Our{" "}
          <A href="/privacy">Privacy Policy</A> explains how we handle personal
          information; it is not a contractual term but you should read it.
        </P>
      </Clause>

      <Clause id="using-the-site" number={2} title="Using this website">
        <P>
          We grant you a limited, personal, non-exclusive, non-transferable,
          revocable licence to access and view this website for your own
          informational and business-evaluation purposes. That licence does not
          include any right to resell the site, to use it to build a competing
          service, or to use automated means to extract its contents at scale.
        </P>
        <P>
          You must be at least 16 years old, and legally capable of entering into
          these terms, to use this site. If you are using it on behalf of an
          organisation, you confirm you are authorised to bind that organisation.
        </P>
        <P>
          You must not use the site in any way prohibited by our{" "}
          <A href="/acceptable-use">Acceptable Use Policy</A>. We may suspend or
          block access to anyone who breaches these terms, without notice.
        </P>
      </Clause>

      <Clause id="no-offer" number={3} title="Information only — this is not an offer or a contract for products">
        <P>
          Everything on this website, including product descriptions, capability
          claims, roadmap statements and anything the AI assistant tells you, is
          provided for general information. It is <Term>not</Term> an offer, a
          quotation, a commitment to deliver, a warranty, or a representation you
          may rely on in deciding to enter into a transaction.
        </P>
        <P>
          Any actual supply of products or services by us is governed exclusively
          by a separate written agreement signed by both parties. Where anything on
          this website conflicts with such an agreement, the signed agreement
          prevails. Descriptions of products, features and availability may change
          at any time without notice.
        </P>
      </Clause>

      <Clause id="ai-assistant" number={4} title="The AI assistant">
        <P>
          This website includes an AI assistant that generates responses
          automatically using a large language model. Its output can be incomplete,
          out of date, or simply wrong, and it must not be relied upon. Your use of
          it is subject to our{" "}
          <A href="/ai-disclaimer">AI Assistant Terms &amp; Disclaimer</A>, which
          forms part of these terms and which you should read before using it.
        </P>
        <P>
          Do not submit confidential, sensitive or personal information about
          yourself or anyone else to the assistant.
        </P>
      </Clause>

      <Clause id="submissions" number={5} title="Anything you send us">
        <P>
          If you send us a message, feedback, an idea or a suggestion — through the
          contact form, the assistant, or by email — you grant us a
          non-exclusive, worldwide, royalty-free, perpetual and irrevocable licence
          to use, reproduce and act on it for the purpose of operating and improving
          our business, without any obligation of confidentiality, attribution or
          compensation to you.
        </P>
        <P>
          This is deliberately narrow in one important respect: it does not give us
          rights to your confidential business information. Please do not send us
          anything confidential through this website. If you need to share something
          confidential, contact us at{" "}
          <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A> and we will put a
          confidentiality agreement in place first.
        </P>
        <P>
          You confirm that anything you send us is yours to send, and that it does
          not infringe anyone else&rsquo;s rights or break any law.
        </P>
      </Clause>

      <Clause id="ip" number={6} title="Intellectual property">
        <P>
          The website and everything in it — text, design, layout, graphics, the{" "}
          {COMPANY.name} name and logo, and the underlying software — is owned by us
          or our licensors and is protected by copyright, trade mark and other
          intellectual property laws. The {COMPANY.name} name, the logo, and
          &ldquo;{COMPANY.mission}&rdquo; are our trade marks and may not be used
          without our prior written permission.
        </P>
        <P>Except as expressly permitted in section 2, you must not:</P>
        <UL>
          <LI>
            copy, reproduce, republish, frame or mirror any part of this website;
          </LI>
          <LI>
            modify, adapt, translate or create derivative works from it;
          </LI>
          <LI>
            reverse engineer or attempt to derive the source code of any part of
            it, except to the extent that restriction is prohibited by law;
          </LI>
          <LI>
            remove, obscure or alter any copyright, trade mark or other proprietary
            notice.
          </LI>
        </UL>
      </Clause>

      <Clause id="third-party" number={7} title="Third-party links and services">
        <P>
          This website links to third-party sites and relies on third-party
          infrastructure. We do not control those parties, we do not endorse their
          content by linking to it, and we are not responsible for their content,
          practices or availability. Your dealings with them are between you and
          them, on their terms.
        </P>
      </Clause>

      <Clause id="availability" number={8} title="Availability and changes">
        <P>
          We provide this website on an &ldquo;as available&rdquo; basis. We do not
          guarantee it will be uninterrupted, error-free or secure, and we may
          change, suspend, restrict or discontinue any part of it — including the AI
          assistant — at any time, with or without notice, without liability to you.
        </P>
        <P>
          We may revise these terms from time to time. The &ldquo;last
          updated&rdquo; date at the top of this page reflects the current version,
          and changes take effect when published. Continuing to use the site after a
          change means you accept the revised terms.
        </P>
      </Clause>

      <Clause id="disclaimer" number={9} title="Disclaimer of warranties">
        <Callout>
          <p>
            <Term>
              This website and the AI assistant are provided &ldquo;as is&rdquo; and
              &ldquo;as available&rdquo;, without warranties of any kind.
            </Term>{" "}
            To the fullest extent permitted by law, we disclaim all warranties,
            express, implied or statutory, including implied warranties of
            merchantability, fitness for a particular purpose, title,
            non-infringement, accuracy and quiet enjoyment.
          </p>
        </Callout>
        <P>
          In particular, we do not warrant that the content of this site or the
          output of the AI assistant is accurate, complete, current or fit for any
          purpose, that the site will be available or free of errors or harmful
          components, or that any defect will be corrected.
        </P>
        <P>
          Some jurisdictions do not allow the exclusion of certain warranties, so
          some of the above may not apply to you. Nothing in these terms excludes or
          limits any right you have that cannot lawfully be excluded or limited.
        </P>
      </Clause>

      <Clause id="liability" number={10} title="Limitation of liability">
        <P>
          To the fullest extent permitted by law, neither we nor our officers,
          directors, employees, agents or suppliers will be liable for any indirect,
          incidental, special, consequential, exemplary or punitive damages, or for
          any loss of profits, revenue, business, goodwill, data or anticipated
          savings, arising out of or in connection with your use of this website or
          the AI assistant — whether in contract, tort (including negligence),
          strict liability or otherwise, and whether or not we were advised of the
          possibility of such damages.
        </P>
        <P>
          Our total aggregate liability arising out of or relating to this website
          and these terms will not exceed one hundred United States dollars
          (US$100).
        </P>
        <P>
          These limits reflect an agreed allocation of risk for a website provided
          free of charge, and they apply even if a limited remedy is found to have
          failed of its essential purpose. Nothing here limits liability for fraud,
          fraudulent misrepresentation, death or personal injury caused by
          negligence, or any other liability that cannot lawfully be limited.
        </P>
      </Clause>

      <Clause id="indemnity" number={11} title="Indemnity">
        <P>
          You agree to indemnify and hold us harmless from any claims, liabilities,
          damages, losses and reasonable legal costs arising out of your use of this
          website in breach of these terms or our{" "}
          <A href="/acceptable-use">Acceptable Use Policy</A>, or out of any content
          you submit to us. We reserve the right to control the defence of any such
          claim, and you agree to cooperate with us in doing so.
        </P>
      </Clause>

      <Clause id="law" number={12} title="Governing law and disputes">
        <P>
          These terms, and any dispute arising out of them or your use of this
          website, are governed by the laws of the State of Texas, United States,
          without regard to its conflict-of-laws rules. You and we agree to the
          exclusive jurisdiction of the state and federal courts located in Travis
          County, Texas, and each of us waives any objection to venue there.
        </P>
        <P>
          If you are a consumer resident in a jurisdiction whose law grants you the
          right to bring proceedings in your local courts or to rely on your local
          consumer protection law, this section does not remove that right.
        </P>
        <SubHeading>Time limit on claims</SubHeading>
        <P>
          Any claim relating to this website must be brought within one year after
          it arises, to the extent that shortened period is permitted by applicable
          law. Otherwise it is permanently barred.
        </P>
      </Clause>

      <Clause id="general" number={13} title="General">
        <UL>
          <LI>
            <Term>Entire agreement.</Term> These terms, together with the policies
            they incorporate, are the entire agreement between you and us regarding
            this website, and supersede any prior understanding about it.
          </LI>
          <LI>
            <Term>Severability.</Term> If any provision is held unenforceable, it
            is modified to the minimum extent necessary, or severed, and the rest
            remains in force.
          </LI>
          <LI>
            <Term>No waiver.</Term> Our failure to enforce a provision is not a
            waiver of it.
          </LI>
          <LI>
            <Term>Assignment.</Term> You may not assign these terms. We may assign
            them in connection with a merger, acquisition or sale of assets.
          </LI>
          <LI>
            <Term>No third-party beneficiaries.</Term> These terms create no rights
            for anyone other than you and us.
          </LI>
          <LI>
            <Term>Force majeure.</Term> Neither party is liable for failures caused
            by events beyond its reasonable control.
          </LI>
        </UL>
      </Clause>

      <Clause id="contact" number={14} title="Contact">
        <P>
          Questions about these terms can go to{" "}
          <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A>, or by post to{" "}
          {COMPANY.name}, {COMPANY.address.street} {COMPANY.address.suite},{" "}
          {COMPANY.address.city}, {COMPANY.address.state} {COMPANY.address.zip},
          United States.
        </P>
      </Clause>
    </LegalDocument>
  );
}
