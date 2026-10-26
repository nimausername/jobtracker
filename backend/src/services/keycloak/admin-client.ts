import { conflict, AppError } from "../../lib/errors.js";
import type { KeycloakTokenClient } from "./token-client.js";
import type { KeycloakUrls } from "./urls.js";

export type CreateUserInput = {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
};

/**
 * Keycloak Admin API helpers for user provisioning.
 */
export class KeycloakAdminClient {
  constructor(
    private readonly urls: KeycloakUrls,
    private readonly tokenClient: KeycloakTokenClient,
  ) {}

  /**
   * Creates an enabled user with a permanent password.
   */
  async createUser(input: CreateUserInput): Promise<{ readonly id: string }> {
    const accessToken = await this.tokenClient.getClientCredentialsToken();

    const [firstName, ...rest] = (input.name ?? "").trim().split(/\s+/);
    const lastName = rest.join(" ");

    const createResponse = await fetch(this.urls.usersUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: input.email.toLowerCase(),
        email: input.email.toLowerCase(),
        enabled: true,
        emailVerified: true,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      }),
    });

    if (createResponse.status === 409) {
      throw conflict("An account with this email already exists");
    }

    if (!createResponse.ok) {
      const detail = await createResponse.text();
      throw new AppError(
        "INTERNAL",
        `Failed to create Keycloak user: ${detail || createResponse.statusText}`,
        502,
      );
    }

    const location = createResponse.headers.get("location");
    const idFromLocation = location?.split("/").filter(Boolean).at(-1);
    const id =
      idFromLocation ??
      (await this.findUserIdByEmail(accessToken, input.email.toLowerCase()));

    if (!id) {
      throw new AppError("INTERNAL", "Created user but could not resolve id", 502);
    }

    await this.setPassword(accessToken, id, input.password);
    return { id };
  }

  private async setPassword(
    accessToken: string,
    userId: string,
    password: string,
  ): Promise<void> {
    const response = await fetch(`${this.urls.usersUrl}/${userId}/reset-password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "password",
        value: password,
        temporary: false,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(
        "INTERNAL",
        `Failed to set user password: ${detail || response.statusText}`,
        502,
      );
    }
  }

  private async findUserIdByEmail(
    accessToken: string,
    email: string,
  ): Promise<string | undefined> {
    const url = new URL(this.urls.usersUrl);
    url.searchParams.set("email", email);
    url.searchParams.set("exact", "true");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const users = (await response.json()) as Array<{ id?: string }>;
    return users[0]?.id;
  }
}
