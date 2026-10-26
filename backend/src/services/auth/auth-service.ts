import type { Env } from "../../config/env.js";
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

  constructor(env: Env) {
    const urls = createKeycloakUrls(env);
    this.tokenClient = new KeycloakTokenClient(env, urls);
    this.adminClient = new KeycloakAdminClient(urls, this.tokenClient);
    this.issuer = urls.issuer;
    this.jwksUrl = urls.jwksUrl;
  }

  /**
   * Registers a user in Keycloak and returns tokens.
   */
  async register(input: RegisterInput): Promise<TokenResponse> {
    await this.adminClient.createUser({
      email: input.email,
      password: input.password,
      ...(input.name ? { name: input.name } : {}),
    });

    return this.tokenClient.passwordGrant(
      input.email.toLowerCase(),
      input.password,
    );
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
}
