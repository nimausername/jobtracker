import type { Env } from "../../config/env.js";

/**
 * Builds Keycloak realm and admin URLs from env.
 */
export const createKeycloakUrls = (env: Env) => {
  const realmBase = `${env.KEYCLOAK_URL.replace(/\/$/, "")}/realms/${env.KEYCLOAK_REALM}`;
  const adminBase = `${env.KEYCLOAK_URL.replace(/\/$/, "")}/admin/realms/${env.KEYCLOAK_REALM}`;

  return {
    realmBase,
    adminBase,
    issuer: realmBase,
    tokenUrl: `${realmBase}/protocol/openid-connect/token`,
    logoutUrl: `${realmBase}/protocol/openid-connect/logout`,
    jwksUrl: `${realmBase}/protocol/openid-connect/certs`,
    usersUrl: `${adminBase}/users`,
  } as const;
};

export type KeycloakUrls = ReturnType<typeof createKeycloakUrls>;
