import type { Metadata } from "next";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/legal-page-shell";
import { SITE_INFO } from "@/lib/legal/site-info";

export const metadata: Metadata = {
  title: `Imprint · ${SITE_INFO.productName}`,
  description: `Legal notice (Impressum) for ${SITE_INFO.productFullName}.`,
};

/**
 * German-style imprint / legal notice for the hosted service.
 */
const ImprintPage = () => {
  return (
    <LegalPageShell
      currentPath="/imprint"
      title="Imprint"
      description="Legal notice (Impressum) for the Job Tracker personal project."
    >
      <LegalSection id="provider" title="Service provider">
        <p>
          <strong>{SITE_INFO.operatorName}</strong>
          <br />
          Private individual
          <br />
          {SITE_INFO.addressLines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <p>{SITE_INFO.projectNature}</p>
        <p>{SITE_INFO.taxStatus}</p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Email:{" "}
          <a href={`mailto:${SITE_INFO.contactEmail}`}>
            {SITE_INFO.contactEmail}
          </a>
        </p>
        <p>Phone: not published; contact by email.</p>
        <p>
          Service URL:{" "}
          <a
            href={SITE_INFO.productionUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE_INFO.productionUrl}
          </a>
        </p>
      </LegalSection>

      <LegalSection id="product" title="Product">
        <p>
          <strong>{SITE_INFO.productFullName}</strong> — {SITE_INFO.tagline}
        </p>
        <p>
          Hosting: {SITE_INFO.hostingProvider}, {SITE_INFO.hostingRegion}.
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
          ({SITE_INFO.licenseName}).
        </p>
      </LegalSection>

      <LegalSection id="responsible" title="Responsible for content">
        <p>
          {SITE_INFO.operatorName}, {SITE_INFO.addressLines.join(", ")}.
        </p>
      </LegalSection>

      <LegalSection id="dispute" title="Dispute resolution">
        <p>
          EU ODR platform:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . {SITE_INFO.operatorName} is neither obliged nor willing to
          participate in dispute resolution before a consumer arbitration board.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};

export default ImprintPage;
