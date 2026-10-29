import { conflict, AppError } from "../../lib/errors.js";
import type { KeycloakTokenClient } from "./token-client.js";
import type { KeycloakUrls } from "./urls.js";

export type CreateUserInput = {
  readonly email: string;
  readonly password: string;
  readonly firstName?: string;
  readonly lastName?: string;
  /** @deprecated Prefer firstName + lastName. */
  readonly name?: string;
};

export type ResolveDisplayNamesInput = {
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  /** @deprecated Prefer firstName + lastName. */
  readonly name?: string;
};

type KeycloakUserRepresentation = {
  readonly id?: string;
  readonly username?: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly enabled?: boolean;
  readonly emailVerified?: boolean;
  readonly requiredActions?: readonly string[];
};

/**
 * Derives first/last name for Keycloak user profile requirements.
 * Realms with VERIFY_PROFILE often require both attributes; a single
 * given name alone leaves Direct Access Grants failing with invalid_grant.
 */
export const resolveDisplayNames = (
  input: ResolveDisplayNamesInput,
): { readonly firstName: string; readonly lastName: string } => {
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();

  if (firstName && lastName) {
    return { firstName, lastName };
  }

  const parts = (input.name ?? "").trim().split(/\s+/).filter(Boolean);
  const emailLocal = input.email.split("@")[0]?.trim() || "User";

  if (parts.length === 0) {
    return { firstName: emailLocal, lastName: emailLocal };
  }

  if (parts.length === 1) {
    return { firstName: parts[0]!, lastName: parts[0]! };
  }

  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(" "),
  };
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
   * Creates an enabled user with a permanent password and no pending actions.
   */
  async createUser(input: CreateUserInput): Promise<{ readonly id: string }> {
    const accessToken = await this.tokenClient.getClientCredentialsToken();
    const email = input.email.toLowerCase();
    const { firstName, lastName } = resolveDisplayNames({
      email,
      ...(input.firstName ? { firstName: input.firstName } : {}),
      ...(input.lastName ? { lastName: input.lastName } : {}),
      ...(input.name ? { name: input.name } : {}),
    });

    const createResponse = await fetch(this.urls.usersUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,
        email,
        enabled: true,
        emailVerified: true,
        firstName,
        lastName,
        requiredActions: [],
        credentials: [
          {
            type: "password",
            value: input.password,
            temporary: false,
          },
        ],
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
      idFromLocation ?? (await this.findUserIdByEmail(accessToken, email));

    if (!id) {
      throw new AppError("INTERNAL", "Created user but could not resolve id", 502);
    }

    // Realm defaults can still attach VERIFY_PROFILE / VERIFY_EMAIL after create.
    await this.clearRequiredActions(accessToken, id);

    return { id };
  }

  /**
   * Finds a user id by exact email match.
   */
  async findUserIdByEmailAddress(
    email: string,
  ): Promise<string | undefined> {
    const accessToken = await this.tokenClient.getClientCredentialsToken();
    return this.findUserIdByEmail(accessToken, email.toLowerCase());
  }

  /**
   * Emails the user a Keycloak required-action link (e.g. UPDATE_PASSWORD).
   * Returns quietly when the user is missing so callers can avoid account enumeration.
   */
  async sendExecuteActionsEmail(input: {
    readonly userId: string;
    readonly actions: readonly string[];
    readonly clientId?: string;
    readonly redirectUri?: string;
    readonly lifespanSeconds?: number;
  }): Promise<void> {
    const accessToken = await this.tokenClient.getClientCredentialsToken();
    const url = new URL(
      `${this.urls.usersUrl}/${input.userId}/execute-actions-email`,
    );

    if (input.clientId) {
      url.searchParams.set("client_id", input.clientId);
    }
    if (input.redirectUri) {
      url.searchParams.set("redirect_uri", input.redirectUri);
    }
    if (typeof input.lifespanSeconds === "number") {
      url.searchParams.set("lifespan", String(input.lifespanSeconds));
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input.actions),
    });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(
        "INTERNAL",
        `Failed to send execute-actions email: ${detail || response.statusText}`,
        502,
      );
    }
  }

  /**
   * Sets a permanent password for a Keycloak user.
   */
  async setPassword(userId: string, password: string): Promise<void> {
    const accessToken = await this.tokenClient.getClientCredentialsToken();
    const response = await fetch(
      `${this.urls.usersUrl}/${userId}/reset-password`,
      {
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
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(
        "INTERNAL",
        `Failed to set Keycloak password: ${detail || response.statusText}`,
        502,
      );
    }
  }

  /**
   * Permanently deletes a Keycloak user by id.
   */
  async deleteUser(userId: string): Promise<void> {
    const accessToken = await this.tokenClient.getClientCredentialsToken();
    const response = await fetch(`${this.urls.usersUrl}/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(
        "INTERNAL",
        `Failed to delete Keycloak user: ${detail || response.statusText}`,
        502,
      );
    }
  }

  private async clearRequiredActions(
    accessToken: string,
    userId: string,
  ): Promise<void> {
    const getResponse = await fetch(`${this.urls.usersUrl}/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!getResponse.ok) {
      return;
    }

    const user = (await getResponse.json()) as KeycloakUserRepresentation;
    if (!user.requiredActions || user.requiredActions.length === 0) {
      return;
    }

    const putResponse = await fetch(`${this.urls.usersUrl}/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...user,
        enabled: true,
        emailVerified: true,
        requiredActions: [],
      }),
    });

    if (!putResponse.ok) {
      const detail = await putResponse.text();
      throw new AppError(
        "INTERNAL",
        `Failed to clear required actions: ${detail || putResponse.statusText}`,
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
