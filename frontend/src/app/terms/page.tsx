import type { Metadata } from "next";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/legal-page-shell";
import { SITE_INFO } from "@/lib/legal/site-info";

export const metadata: Metadata = {
  title: `Terms of Service · ${SITE_INFO.productName}`,
  description: `Terms for using the hosted ${SITE_INFO.productFullName} service.`,
};

/**
 * Terms of service for the hosted Job Tracker instance.
 */
const TermsPage = () => {
  return (
    <LegalPageShell
      currentPath="/terms"
      title="Terms of Service"
      description="Rules for using the hosted Job Tracker service operated by Nima Khabbazi."
    >
      <LegalSection id="agreement" title="1. Agreement">
        <p>
          By creating an account you must accept these Terms and the{" "}
          <a href="/privacy">Privacy Policy</a>. Acceptance is recorded (including
          document version, time, and technical metadata). If you do not agree,
          do not register or use the service.
        </p>
      </LegalSection>

      <LegalSection id="service" title="2. The service">
        <p>
          {SITE_INFO.productFullName} is a personal, non-commercial, open-source
          job application tracker. {SITE_INFO.projectNature}{" "}
          {SITE_INFO.tagline}
        </p>
        <p>
          Source:{" "}
          <a
            href={SITE_INFO.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE_INFO.sourceUrl}
          </a>{" "}
          ({SITE_INFO.licenseName}). These Terms apply to the hosted instance at{" "}
          {SITE_INFO.productionUrl}, not every third-party self-hosted
          deployment.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="3. Accounts">
        <p>
          You must be at least {SITE_INFO.minAge} years old to create an account
          and use the hosted service. By registering you confirm that you meet
          this age requirement and can accept these Terms. Keep your credentials
          confidential; you are responsible for activity under your account.
        </p>
      </LegalSection>

      <LegalSection id="your-content" title="4. Your content">
        <p>
          You retain ownership of applications and notes you submit. You grant
          the operator a limited license to host and display that content solely
          to provide the service. Do not upload unlawful or harmful content.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="5. Acceptable use">
        <ul>
          <li>Do not abuse, disrupt, or attempt unauthorized access.</li>
          <li>Do not use the service for spam or unlawful processing of others&apos; data.</li>
          <li>Do not overload or scrape the service in a harmful way.</li>
        </ul>
        <p>
          Accounts that violate these Terms or threaten stability/security may
          be suspended or deleted.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="6. Availability and deletion">
        <p>
          The hosted service is free and best-effort, with no SLA. Features may
          change or stop. {SITE_INFO.backups}
        </p>
        <p>
          You can export your data or delete your account in-app under Account.
          You may also email{" "}
          <a href={`mailto:${SITE_INFO.contactEmail}`}>
            {SITE_INFO.contactEmail}
          </a>
          ; verified email requests are handled {SITE_INFO.deletionSla}.
        </p>
      </LegalSection>

      <LegalSection id="open-source" title="7. Open-source disclaimer">
        <p>
          Software is provided under the {SITE_INFO.licenseName} “AS IS”. See the{" "}
          <a
            href={SITE_INFO.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            LICENSE
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="liability" title="8. Liability">
        <p>
          To the fullest extent permitted by German law, the free hosted service
          is provided without warranties of uninterrupted or error-free
          operation. Liability that cannot be limited (intent, gross negligence,
          injury to life, body, or health) remains unaffected. Remaining
          liability for ordinary negligence is limited as far as legally allowed
          for a free personal project.
        </p>
      </LegalSection>

      <LegalSection id="law" title="9. Governing law">
        <p>
          These Terms are governed by the laws of {SITE_INFO.governingLaw},
          excluding conflict-of-law rules. Mandatory consumer protections where
          applicable remain unaffected.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="10. Contact">
        <p>
          <a href={`mailto:${SITE_INFO.contactEmail}`}>
            {SITE_INFO.contactEmail}
          </a>
          . <a href="/imprint">Imprint</a>. Document version:{" "}
          {SITE_INFO.documentsVersion}.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};

export default TermsPage;
