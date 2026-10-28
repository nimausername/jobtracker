import type { Env } from "../../config/env.js";
import { badRequest } from "../../lib/errors.js";
import { LEGAL_DOCUMENTS_VERSION } from "../../lib/legal-documents.js";
import type { LegalAcceptancesRepository } from "../../repositories/legal-acceptances-repository.js";
import { KeycloakAdminClient } from "../keycloak/admin-client.js";
import {
  KeycloakTokenClient,
  type TokenResponse,
} from "../keycloak/token-client.js";
import { createKeycloakUrls } from "../keycloak/urls.js";

export type RegisterInput = {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
  readonly acceptedLegal: true;
  readonly documentsVersion: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
};

export type RegisterResult = {
  readonly created: true;
};

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

export type AuthResult = TokenResponse & {
  readonly userId: string;
};

/**
 * Application auth use-cases backed by Keycloak.
 */
export class AuthService {
  private readonly tokenClient: KeycloakTokenClient;
  private readonly adminClient: KeycloakAdminClient;
  readonly issuer: string;
  readonly jwksUrl: string;

  constructor(
    env: Env,
    private readonly legalAcceptancesRepository: LegalAcceptancesRepository,
  ) {
    const urls = createKeycloakUrls(env);
    this.tokenClient = new KeycloakTokenClient(env, urls);
    this.adminClient = new KeycloakAdminClient(urls, this.tokenClient);
    this.issuer = urls.issuer;
    this.jwksUrl = urls.jwksUrl;
  }

  /**
   * Registers a user in Keycloak and records legal acceptance.
   * Does not create a session; the client should send the user to login.
   */
  async register(input: RegisterInput): Promise<RegisterResult> {
    if (input.documentsVersion !== LEGAL_DOCUMENTS_VERSION) {
      throw badRequest(
        "Legal documents version is outdated. Refresh the page and try again.",
        [{ field: "documentsVersion", reason: "OUTDATED" }],
      );
    }

    const { id: userId } = await this.adminClient.createUser({
      email: input.email,
      password: input.password,
      ...(input.name ? { name: input.name } : {}),
    });

    try {
      await this.legalAcceptancesRepository.create({
        userId,
        email: input.email,
        documentsVersion: input.documentsVersion,
        acceptedTerms: true,
        acceptedPrivacy: true,
        ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
        ...(input.userAgent ? { userAgent: input.userAgent } : {}),
      });
    } catch (error) {
      await this.adminClient.deleteUser(userId).catch(() => undefined);
      throw error;
    }

    return { created: true };
  }

  /**
   * Authenticates with email and password.
   */
  async login(input: LoginInput): Promise<TokenResponse> {
    return this.tokenClient.passwordGrant(
      input.email.toLowerCase(),
      input.password,
    );
  }

  /**
   * Refreshes tokens using a refresh token.
   */
  async refresh(refreshToken: string): Promise<TokenResponse> {
    return this.tokenClient.refresh(refreshToken);
  }

  /**
   * Revokes the Keycloak session associated with a refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenClient.logout(refreshToken);
  }
}
