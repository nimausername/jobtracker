import type { Env } from "../../config/env.js";
import { AppError, badRequest, unauthorized } from "../../lib/errors.js";
import type { KeycloakUrls } from "./urls.js";

export type TokenResponse = {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly refreshExpiresIn: number;
  readonly tokenType: string;
};

type KeycloakTokenJson = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

/**
 * Exchanges credentials or refresh tokens with Keycloak's token endpoint.
 */
export class KeycloakTokenClient {
  constructor(
    private readonly env: Env,
    private readonly urls: KeycloakUrls,
  ) {}

  /**
   * Obtains a service-account token for Admin API calls.
   */
  async getClientCredentialsToken(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.env.KEYCLOAK_CLIENT_ID,
      client_secret: this.env.KEYCLOAK_CLIENT_SECRET,
    });

    const json = await this.requestToken(body);
    if (!json.access_token) {
      throw new AppError("INTERNAL", "Keycloak did not return an access token", 500);
    }

    return json.access_token;
  }

  /**
   * Logs a user in with username/password (Direct Access Grants).
   */
  async passwordGrant(username: string, password: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: "password",
      client_id: this.env.KEYCLOAK_CLIENT_ID,
      client_secret: this.env.KEYCLOAK_CLIENT_SECRET,
      username,
      password,
      scope: "openid profile email offline_access",
    });

    const json = await this.requestToken(body);
    return this.toTokenResponse(json);
  }

  /**
   * Refreshes an access token.
   */
  async refresh(refreshToken: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.env.KEYCLOAK_CLIENT_ID,
      client_secret: this.env.KEYCLOAK_CLIENT_SECRET,
      refresh_token: refreshToken,
    });

    const json = await this.requestToken(body);
    return this.toTokenResponse(json);
  }

  private async requestToken(
    body: URLSearchParams,
  ): Promise<KeycloakTokenJson> {
    const response = await fetch(this.urls.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const json = (await response.json()) as KeycloakTokenJson;

    if (!response.ok) {
      const description = json.error_description ?? json.error ?? "Token request failed";

      if (response.status === 401 || json.error === "invalid_grant") {
        throw unauthorized("Invalid email or password");
      }

      if (response.status === 400) {
        throw badRequest(description);
      }

      throw new AppError("INTERNAL", description, 502);
    }

    return json;
  }

  private toTokenResponse(json: KeycloakTokenJson): TokenResponse {
    if (!json.access_token || !json.refresh_token) {
      throw new AppError("INTERNAL", "Keycloak token response incomplete", 502);
    }

    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresIn: json.expires_in ?? 300,
      refreshExpiresIn: json.refresh_expires_in ?? 1800,
      tokenType: json.token_type ?? "Bearer",
    };
  }
}
