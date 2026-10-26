import type { Metadata } from "next";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/legal-page-shell";
import { BROWSER_STORAGE_ITEMS, SITE_INFO } from "@/lib/legal/site-info";

export const metadata: Metadata = {
  title: `Cookie Policy · ${SITE_INFO.productName}`,
  description: `Cookies and local storage used by ${SITE_INFO.productFullName}.`,
};

/**
 * Cookie and local-storage disclosure for the hosted service.
 */
const CookiesPage = () => {
  return (
    <LegalPageShell
      currentPath="/cookies"
      title="Cookie Policy"
      description="Full inventory of cookies and similar browser storage used by Job Tracker."
    >
      <LegalSection id="overview" title="1. Overview">
        <p>
          {SITE_INFO.productName} only uses{" "}
          <strong>strictly necessary</strong> and <strong>functional</strong>{" "}
          browser storage so you can sign in and use the dashboard. We do{" "}
          <strong>not</strong> use analytics, advertising, or social tracking
          cookies.
        </p>
      </LegalSection>

      <LegalSection id="inventory" title="2. Storage inventory">
        <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead className="bg-muted/60 text-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Technology</th>
                <th className="px-3 py-2 font-medium">Domain / scope</th>
                <th className="px-3 py-2 font-medium">Purpose</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Duration</th>
                <th className="px-3 py-2 font-medium">Essential</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {BROWSER_STORAGE_ITEMS.map((item) => (
                <tr
                  key={item.name}
                  className="border-t border-border/70 align-top"
                >
                  <td className="px-3 py-2 font-mono text-xs text-foreground">
                    {item.name}
                  </td>
                  <td className="px-3 py-2">{item.technology}</td>
                  <td className="px-3 py-2">{item.domain}</td>
                  <td className="px-3 py-2">{item.purpose}</td>
                  <td className="px-3 py-2">{item.category}</td>
                  <td className="px-3 py-2">{item.duration}</td>
                  <td className="px-3 py-2">{item.essential}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="keycloak" title="3. Authentication domain">
        <p>
          Sign-in uses the Job Tracker API with Keycloak at{" "}
          <a
            href={SITE_INFO.authUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE_INFO.authUrl}
          </a>
          . App session tokens are stored as httpOnly cookies on the API host (
          <span className="font-mono text-xs text-foreground">jt_access</span>,{" "}
          <span className="font-mono text-xs text-foreground">jt_refresh</span>
          ), not in localStorage.
        </p>
        <p>
          If you open the Keycloak host directly, Keycloak may set its own
          first-party cookies on that auth domain (for example{" "}
          <span className="font-mono text-xs text-foreground">
            AUTH_SESSION_ID
          </span>
          ,{" "}
          <span className="font-mono text-xs text-foreground">
            KEYCLOAK_SESSION
          </span>
          , or{" "}
          <span className="font-mono text-xs text-foreground">
            KEYCLOAK_IDENTITY
          </span>
          ).
        </p>
      </LegalSection>

      <LegalSection id="fonts" title="4. Fonts">
        <p>
          The frontend loads Plus Jakarta Sans, Schoolbell, and JetBrains Mono
          via Next.js <span className="font-mono text-xs">next/font</span>. Font
          files are typically self-hosted by the app after build. No marketing
          cookies are set for fonts.
        </p>
      </LegalSection>

      <LegalSection id="manage" title="5. Managing storage">
        <p>
          Sign out clears the httpOnly auth cookies via the API. You can also
          clear site cookies in your browser. Blocking{" "}
          <span className="font-mono text-xs text-foreground">sidebar_state</span>{" "}
          only resets the sidebar preference.
        </p>
        <p>
          Because only necessary/functional storage is used, there is no
          marketing-consent banner. If non-essential cookies are added later,
          this policy and a consent mechanism will be updated.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="6. Contact">
        <p>
          Questions:{" "}
          <a href={`mailto:${SITE_INFO.contactEmail}`}>
            {SITE_INFO.contactEmail}
          </a>
          . See also the <a href="/privacy">Privacy Policy</a>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};

export default CookiesPage;
