// =============================================================================
// FILE: src/app/ai-disclaimer/page.tsx
// PURPOSE: AI Assistant Terms & Disclaimer (/ai-disclaimer).
//
// WHY A SEPARATE POLICY FOR THIS: an AI company running a public LLM on its
//          marketing site has a specific exposure that a general ToS does not
//          cover well — the assistant states things about our products in our
//          voice, and a visitor could reasonably treat that as a representation
//          by us. This page is where that expectation is set. It also documents
//          the data flow to the inference provider in one place, which the
//          Privacy Policy then cross-references.
//
// The technical description in section 2 mirrors functions/api/assistant.ts. If
// the model chain, retention or rate limits change there, change them here.
// =============================================================================

import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { A, Callout, Clause, LI, P, SubHeading, Term, UL } from "@/components/legal/prose";
import { COMPANY, legalLink } from "@/lib/constants";

const POLICY = legalLink("/ai-disclaimer");

export const metadata: Metadata = {
  title: `${POLICY.title} | ${COMPANY.name}`,
  description: POLICY.description,
  alternates: { canonical: `https://${COMPANY.domain}/ai-disclaimer` },
};

export default function AiDisclaimer() {
  return (
    <LegalDocument
      title={POLICY.title}
      intro={`This page explains how the AI assistant on this website works, what it can and cannot be relied on for, and the terms that apply when you use it. It forms part of our Terms of Service.`}
    >
      <Callout>
        <p>
          <Term>Read this first.</Term> The assistant generates text with a large
          language model. It can be confidently wrong. Nothing it says is a
          statement, promise, offer or commitment by {COMPANY.name}, and nothing it
          says should be relied on for any decision. Verify anything that matters
          with a human by emailing{" "}
          <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A>.
        </p>
      </Callout>

      <Clause id="what-it-is" number={1} title="What the assistant is">
        <P>
          The assistant is a conversational interface intended to answer general
          questions about {COMPANY.name} — who we are, what we build, and what we are
          working towards. It is a convenience for browsing our site, not a
          substitute for speaking to us.
        </P>
        <P>
          It is <Term>not</Term> a professional adviser. It does not provide legal,
          financial, investment, tax, medical, real-estate, employment or any other
          professional advice, and you must not treat its output as such.
        </P>
      </Clause>

      <Clause id="how-it-works" number={2} title="How it works, and where your messages go">
        <P>
          When you send a message, your browser posts the conversation to our own
          server-side endpoint on this domain. That endpoint adds a set of
          instructions describing our business and forwards the conversation to{" "}
          <Term>Groq, Inc.</Term>, which runs the large language model that generates
          the reply. The reply is streamed back to you.
        </P>
        <UL>
          <LI>
            The request is made by <Term>our server</Term>, not your browser, so
            your IP address is not disclosed to the model provider.
          </LI>
          <LI>
            We do not store your conversation. It exists in your browser for the
            length of your visit and is gone when you close or reload the page. It is
            not written to a database or to our logs.
          </LI>
          <LI>
            The provider may process and transiently retain the request under its own
            terms, including for abuse monitoring. See{" "}
            <A href="https://groq.com/privacy-policy/">Groq&rsquo;s privacy policy</A>
            .
          </LI>
          <LI>
            The underlying model may change without notice. We maintain a list of
            approved models and fall back automatically if one becomes unavailable,
            so the model answering you today may not be the one answering tomorrow.
          </LI>
          <LI>
            For abuse prevention we briefly record a shortened form of your network
            address with request timestamps, which deletes itself within 10 minutes.
            See our <A href="/privacy">Privacy Policy</A>.
          </LI>
        </UL>
      </Clause>

      <Clause id="do-not-submit" number={3} title="What not to type into it">
        <P>
          Treat the assistant as a public channel. Do not submit:
        </P>
        <UL>
          <LI>
            confidential or commercially sensitive information, whether yours or
            your employer&rsquo;s;
          </LI>
          <LI>
            personal information about yourself or anyone else beyond what is
            necessary to ask your question — and never anyone else&rsquo;s personal
            information without their consent;
          </LI>
          <LI>
            sensitive categories of data: health, financial account, government
            identifier, biometric or precise location data;
          </LI>
          <LI>passwords, API keys, tokens or any other credential;</LI>
          <LI>
            anything subject to a confidentiality obligation, or to export control
            or similar restrictions.
          </LI>
        </UL>
        <P>
          If you need to discuss something confidential, email{" "}
          <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A> and we will put an
          appropriate agreement in place first.
        </P>
      </Clause>

      <Clause id="limitations" number={4} title="Known limitations">
        <P>
          These are inherent to the technology, not defects we expect to eliminate:
        </P>
        <UL>
          <LI>
            <Term>Fabrication.</Term> Language models generate plausible text, and
            plausible text can be false. The assistant may invent features, figures,
            dates, names, customers or capabilities that do not exist, and state them
            with complete confidence.
          </LI>
          <LI>
            <Term>Staleness.</Term> Its knowledge of us comes from a fixed set of
            information that may lag the current state of our products, pricing,
            roadmap or team.
          </LI>
          <LI>
            <Term>Inconsistency.</Term> The same question can produce different
            answers on different occasions.
          </LI>
          <LI>
            <Term>Bias.</Term> Output can reflect biases present in the
            model&rsquo;s training data.
          </LI>
          <LI>
            <Term>Misunderstanding.</Term> It may misread an ambiguous question and
            answer a different one, without signalling that it has done so.
          </LI>
          <LI>
            <Term>No memory.</Term> It retains nothing between visits, and only a
            limited window of the current conversation.
          </LI>
        </UL>
      </Clause>

      <Clause id="not-a-representation" number={5} title="Output is not a representation by us">
        <P>
          This is the most important term on this page. Output from the assistant is
          machine-generated and is <Term>not</Term> reviewed by a person before you
          see it. Accordingly:
        </P>
        <UL>
          <LI>
            it is not a statement, representation, warranty, offer, quotation or
            commitment by {COMPANY.name}, and does not bind us in any way;
          </LI>
          <LI>
            it does not create a contract, and it cannot vary the terms of any
            existing agreement between us;
          </LI>
          <LI>
            it does not constitute advice, and no professional or advisory
            relationship arises from using it;
          </LI>
          <LI>
            any description of our products, prices, availability, capabilities or
            plans must be confirmed with us in writing before you rely on it.
          </LI>
        </UL>
        <P>
          Where the assistant&rsquo;s output conflicts with this website, with our{" "}
          <A href="/terms">Terms of Service</A>, or with a signed agreement between
          us, those prevail over the assistant.
        </P>
      </Clause>

      <Clause id="your-responsibilities" number={6} title="Your responsibilities">
        <UL>
          <LI>
            <Term>Verify before you act.</Term> You are responsible for independently
            checking anything you intend to rely on, and for any decision you take.
          </LI>
          <LI>
            <Term>Use it acceptably.</Term> Your use is subject to our{" "}
            <A href="/acceptable-use">Acceptable Use Policy</A>, which prohibits
            attempts to extract our system instructions, to jailbreak the assistant,
            to generate harmful content, or to use its output to train another model.
          </LI>
          <LI>
            <Term>Do not present it as human.</Term> If you reproduce output from
            the assistant, do not represent it as a considered statement from{" "}
            {COMPANY.name} or from a member of our team.
          </LI>
        </UL>
      </Clause>

      <Clause id="ip-and-output" number={7} title="Rights in the output">
        <P>
          We make no claim of ownership over the text the assistant generates in
          response to your questions, and we make no warranty that such output is
          original, non-infringing, or free for you to use. Identical or similar
          output may be generated for other users. If you intend to use the output
          for any purpose beyond reading it, that is at your own risk and you are
          responsible for checking it does not infringe anyone&rsquo;s rights.
        </P>
      </Clause>

      <Clause id="availability" number={8} title="Availability">
        <P>
          The assistant is provided free of charge and as a convenience. We may
          change, rate-limit, suspend or withdraw it at any time without notice. It
          depends on a third-party provider and will sometimes be unavailable or
          slow for reasons outside our control.
        </P>
      </Clause>

      <Clause id="disclaimer" number={9} title="Disclaimer and liability">
        <Callout>
          <p>
            <Term>
              The assistant is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo;, with no warranty of accuracy, completeness,
              currency, reliability or fitness for any purpose.
            </Term>
          </p>
        </Callout>
        <P>
          To the fullest extent permitted by law, we are not liable for any loss or
          damage arising from your use of, or reliance on, the assistant or its
          output. The disclaimers and limitations of liability in sections 9 and 10
          of our <A href="/terms">Terms of Service</A> apply to the assistant in
          full, including the aggregate liability cap set out there.
        </P>
        <P>
          Nothing here excludes any liability that cannot lawfully be excluded.
        </P>
      </Clause>

      <Clause id="feedback" number={10} title="Telling us when it gets something wrong">
        <P>
          If the assistant tells you something inaccurate about us, we would
          genuinely like to know — it means the information we have given it needs
          correcting. Please email{" "}
          <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A> with the question
          you asked and the answer you received.
        </P>
        <SubHeading>Human contact, always available</SubHeading>
        <P>
          You never have to use the assistant to reach us. The contact form on our{" "}
          <A href="/#contact">homepage</A> and the address{" "}
          <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A> both go to a
          person.
        </P>
      </Clause>
    </LegalDocument>
  );
}
