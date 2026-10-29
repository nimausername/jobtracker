import { describe, expect, it, vi } from "vitest";

import { AppError, ErrorCode } from "../../lib/errors.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { KeycloakAdminClient } from "../keycloak/admin-client.js";
import type { KeycloakTokenClient } from "../keycloak/token-client.js";
import { AccountService } from "./account-service.js";

const user = {
  id: "user-1",
  email: "ada@example.com",
  name: "Ada Lovelace",
  firstName: "Ada",
  lastName: "Lovelace",
};

describe("AccountService", () => {
  it("updates profile names through Keycloak", async () => {
    const repository = {} as AccountRepository;
    const keycloakAdmin = {
      updateProfile: vi.fn().mockResolvedValue({
        id: "user-1",
        email: "ada@example.com",
        firstName: "Augusta",
        lastName: "Lovelace",
        name: "Augusta Lovelace",
      }),
    } as unknown as KeycloakAdminClient;
    const keycloakTokens = {} as KeycloakTokenClient;

    const service = new AccountService(
      repository,
      keycloakAdmin,
      keycloakTokens,
    );

    const profile = await service.updateProfile(user, {
      firstName: "Augusta",
      lastName: "Lovelace",
    });

    expect(keycloakAdmin.updateProfile).toHaveBeenCalledWith("user-1", {
      firstName: "Augusta",
      lastName: "Lovelace",
    });
    expect(profile.firstName).toBe("Augusta");
    expect(profile.name).toBe("Augusta Lovelace");
  });

  it("rejects change-password when the current password is wrong", async () => {
    const repository = {} as AccountRepository;
    const keycloakAdmin = {
      setPassword: vi.fn(),
    } as unknown as KeycloakAdminClient;
    const keycloakTokens = {
      passwordGrant: vi
        .fn()
        .mockRejectedValue(
          new AppError(ErrorCode.UNAUTHORIZED, "Invalid email or password", 401),
        ),
    } as unknown as KeycloakTokenClient;

    const service = new AccountService(
      repository,
      keycloakAdmin,
      keycloakTokens,
    );

    await expect(
      service.changePassword(user, {
        currentPassword: "wrong-pass1",
        newPassword: "new-pass12",
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
      message: "Current password is incorrect",
    });
    expect(keycloakAdmin.setPassword).not.toHaveBeenCalled();
  });

  it("sets a new password after verifying the current one", async () => {
    const repository = {} as AccountRepository;
    const keycloakAdmin = {
      setPassword: vi.fn().mockResolvedValue(undefined),
    } as unknown as KeycloakAdminClient;
    const keycloakTokens = {
      passwordGrant: vi.fn().mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        expiresIn: 300,
        refreshExpiresIn: 1800,
        tokenType: "Bearer",
      }),
    } as unknown as KeycloakTokenClient;

    const service = new AccountService(
      repository,
      keycloakAdmin,
      keycloakTokens,
    );

    await service.changePassword(user, {
      currentPassword: "old-pass12",
      newPassword: "new-pass12",
    });

    expect(keycloakTokens.passwordGrant).toHaveBeenCalledWith(
      "ada@example.com",
      "old-pass12",
    );
    expect(keycloakAdmin.setPassword).toHaveBeenCalledWith(
      "user-1",
      "new-pass12",
    );
  });
});
