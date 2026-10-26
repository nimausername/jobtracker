/**
 * Operator and product details used by public legal pages.
 * Update this file when hosting, contact, or processing details change.
 * `documentsVersion` must stay in sync with the backend legal constant.
 */
export const SITE_INFO = {
  productName: "Job Tracker",
  productFullName: "Job Tracker by Nima Khabbazi",
  tagline:
    "Self-hosted job application tracker with in-app Keycloak auth, pipeline statuses, and timeline notes.",
  operatorName: "Nima Khabbazi",
  operatorType: "private individual" as const,
  projectNature:
    "Personal non-commercial project created for the operator’s own job search. The hosted instance generates no income and is not offered as a paid service.",
  addressLines: ["Singener Str.", "78239 Rielasingen-Worblingen", "Germany"],
  contactEmail: "iam@nimakhabbazi.de",
  governingLaw: "Germany",
  productionUrl: "https://jobtracker.nimakhabbazi.de",
  authUrl: "https://auth.nimakhabbazi.de",
  sourceUrl: "https://github.com/nimausername/jobtracker",
  licenseName: "MIT License",
  licenseUrl: "https://github.com/nimausername/jobtracker/blob/main/LICENSE",
  hostingProvider: "Hetzner",
  hostingRegion: "Falkenstein, Germany (eu-central)",
  hostingNotes:
    "Application data is stored in PostgreSQL on a personal Hetzner server in Falkenstein, Germany, managed with Coolify. Authentication and account credentials are handled by a self-hosted Keycloak instance at auth.nimakhabbazi.de.",
  dataRetentionDefault:
    "while the account remains active, or until you request deletion",
  deletionSla: "within 20 business days of a verified request",
  logRetention: "server logs are cleared every 6 months",
  backups: "No automated backups are currently configured.",
  taxStatus: "No VAT ID or commercial tax registration applies; the project generates no income.",
  /**
   * Minimum age for the hosted service (GDPR Art. 8 default in Germany: 16).
   */
  minAge: 16,
  /** Bump when Privacy/Terms/Cookies materially change; must match backend. */
  documentsVersion: "2026-10-26.3",
  lastUpdated: "2026-10-26",
  lastUpdatedLabel: "26 October 2026",
} as const;

export const LEGAL_NAV = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/imprint", label: "Imprint" },
] as const;

/**
 * Browser storage inventory for the Cookie Policy table.
 */
export const BROWSER_STORAGE_ITEMS = [
  {
    name: "jt_access",
    technology: "HTTP cookie (HttpOnly, SameSite=Lax)",
    domain: "API host (first-party to the Job Tracker API)",
    purpose:
      "Short-lived access token for authenticated API requests. Not readable by JavaScript.",
    category: "Strictly necessary",
    duration: "Matches access-token lifetime from Keycloak",
    essential: "Yes — required to stay signed in",
  },
  {
    name: "jt_refresh",
    technology: "HTTP cookie (HttpOnly, SameSite=Lax)",
    domain: "API host (first-party to the Job Tracker API)",
    purpose:
      "Refresh token used to renew the access session without signing in again. Not readable by JavaScript.",
    category: "Strictly necessary",
    duration: "Matches refresh-token lifetime from Keycloak",
    essential: "Yes — required to stay signed in",
  },
  {
    name: "sidebar_state",
    technology: "HTTP cookie",
    domain: "Job Tracker app domain (first-party)",
    purpose:
      "Remembers whether the dashboard sidebar is expanded or collapsed.",
    category: "Functional",
    duration: "7 days (max-age)",
    essential: "Yes (UI preference; service works without it)",
  },
] as const;
