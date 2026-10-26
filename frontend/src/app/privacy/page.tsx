import type { Metadata } from "next";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/legal-page-shell";
import { SITE_INFO } from "@/lib/legal/site-info";

export const metadata: Metadata = {
  title: `Privacy Policy · ${SITE_INFO.productName}`,
  description: `How ${SITE_INFO.productFullName} collects, uses, and protects personal data.`,
};

/**
 * Privacy policy for the hosted Job Tracker instance.
 */
const PrivacyPage = () => {
  return (
    <LegalPageShell
      currentPath="/privacy"
      title="Privacy Policy"
      description="How personal data is processed when you use the hosted Job Tracker service."
    >
      <LegalSection id="controller" title="1. Controller">
        <p>
          The controller for personal data processed through{" "}
          {SITE_INFO.productionUrl} is:
        </p>
        <p>
          <strong>{SITE_INFO.operatorName}</strong>
          <br />
          Private individual (non-commercial personal project)
          <br />
          {SITE_INFO.addressLines.join(", ")}
          <br />
          Email:{" "}
          <a href={`mailto:${SITE_INFO.contactEmail}`}>
            {SITE_INFO.contactEmail}
          </a>
        </p>
        <p>{SITE_INFO.projectNature}</p>
        <p>{SITE_INFO.taxStatus}</p>
      </LegalSection>

      <LegalSection id="scope" title="2. Scope">
        <p>
          This policy applies to the hosted service at{" "}
          <a
            href={SITE_INFO.productionUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE_INFO.productionUrl}
          </a>
          . If you self-host the open-source software, you (or your organization)
          are the controller for that deployment.
        </p>
      </LegalSection>

      <LegalSection id="data" title="3. Data we process">
        <p>Depending on how you use the service, we may process:</p>
        <ul>
          <li>
            <strong>Account data:</strong> email address, display name, and
            authentication credentials managed by Keycloak at{" "}
            <a
              href={SITE_INFO.authUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SITE_INFO.authUrl}
            </a>
            .
          </li>
          <li>
            <strong>Application data:</strong> job applications you create and
            timeline notes you add.
          </li>
          <li>
            <strong>Legal acceptance records:</strong> when you register, we
            store that you accepted the Terms and Privacy Policy, the document
            version, timestamp, and technical metadata (IP address and user
            agent) as evidence of acceptance.
          </li>
          <li>
            <strong>Session / device data:</strong> httpOnly authentication
            cookies (<span className="font-mono text-xs">jt_access</span>,{" "}
            <span className="font-mono text-xs">jt_refresh</span>) on the API
            host, and the functional{" "}
            <span className="font-mono text-xs">sidebar_state</span> cookie on
            the app (see <a href="/cookies">Cookie Policy</a>).
          </li>
          <li>
            <strong>Technical logs:</strong> routine server logs that may
            include IP address, timestamps, and request metadata.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> send product email today, do{" "}
          <strong>not</strong> use analytics or advertising trackers, and do{" "}
          <strong>not</strong> sell personal data.
        </p>
      </LegalSection>

      <LegalSection id="purposes" title="4. Purposes and legal bases">
        <ul>
          <li>
            provide registration, login, and job-tracking features (contract /
            requested service);
          </li>
          <li>
            record and demonstrate acceptance of Terms and Privacy at signup
            (contract / legitimate interest in proving consent to terms);
          </li>
          <li>operate and secure the service (legitimate interests);</li>
          <li>handle deletion and information requests (legal obligation / contract).</li>
        </ul>
      </LegalSection>

      <LegalSection id="hosting" title="5. Hosting and processors">
        <p>{SITE_INFO.hostingNotes}</p>
        <p>
          Infrastructure provider: <strong>{SITE_INFO.hostingProvider}</strong>.
          Region: <strong>{SITE_INFO.hostingRegion}</strong>.
        </p>
        <p>{SITE_INFO.backups}</p>
      </LegalSection>

      <LegalSection id="retention" title="6. Retention">
        <p>
          Account and application data are kept {SITE_INFO.dataRetentionDefault}
          . You can export or delete your account in-app under{" "}
          <strong>Account</strong>. Email requests to{" "}
          <a href={`mailto:${SITE_INFO.contactEmail}`}>
            {SITE_INFO.contactEmail}
          </a>{" "}
          are handled {SITE_INFO.deletionSla}. {SITE_INFO.logRetention}.{" "}
          {SITE_INFO.backups} Legal acceptance evidence may be retained where
          needed for dispute or legal purposes after deletion.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="7. Your rights (GDPR)">
        <p>
          You may have rights to access, rectify, erase, restrict, or object to
          certain processing, and to data portability. Contact{" "}
          <a href={`mailto:${SITE_INFO.contactEmail}`}>
            {SITE_INFO.contactEmail}
          </a>
          . You may lodge a complaint with a supervisory authority (for example
          in Baden-Württemberg or your place of residence).
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="8. International transfers">
        <p>
          Primary processing is intended to remain in Germany / the EU on
          Hetzner infrastructure. See the Cookie Policy for browser storage
          details.
        </p>
      </LegalSection>

      <LegalSection id="audience" title="9. Audience">
        <p>
          Job Tracker is a job-application tracker. There is no fixed minimum
          age stated for the service. By registering you confirm you have the
          legal capacity to agree to the Terms and Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="10. Changes">
        <p>
          We may update this policy when the product or legal requirements
          change. The “Last updated” date and document version (
          {SITE_INFO.documentsVersion}) will be revised when we do. New
          registrations must accept the then-current version.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};

export default PrivacyPage;
