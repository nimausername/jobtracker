import { AppError, ErrorCode } from "../../lib/errors.js";
import type { AuthUser } from "../../plugins/auth.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { ChangePasswordBody, UpdateProfileBody } from "../../schemas/account.js";
import type { KeycloakAdminClient } from "../keycloak/admin-client.js";
import type { KeycloakTokenClient } from "../keycloak/token-client.js";

export type AccountProfile = {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
};

/**
 * Account export, profile, password, and deletion use-cases.
 */
export class AccountService {
  constructor(
    private readonly repository: AccountRepository,
    private readonly keycloakAdmin: KeycloakAdminClient,
    private readonly keycloakTokens: KeycloakTokenClient,
  ) {}

  /**
   * Builds a portable JSON export of the user's data.
   */
  async exportData(user: AuthUser) {
    const [applicationRows, noteRows, acceptanceRows] = await Promise.all([
      this.repository.listApplicationsForUser(user.id),
      this.repository.listNotesForUser(user.id),
      this.repository.listLegalAcceptancesForUser(user.id),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email ?? null,
        name: user.name ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
      },
      applications: applicationRows.map((row) => ({
        id: row.id,
        companyName: row.companyName,
        jobTitle: row.jobTitle,
        jobUrl: row.jobUrl,
        city: row.city,
        country: row.country,
        workArrangement: row.workArrangement,
        status: row.status,
        appliedAt: row.appliedAt?.toISOString() ?? null,
        notes: row.notes,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      applicationNotes: noteRows.map((row) => ({
        id: row.id,
        applicationId: row.applicationId,
        body: row.body,
        createdAt: row.createdAt.toISOString(),
      })),
      legalAcceptances: acceptanceRows.map((row) => ({
        id: row.id,
        documentsVersion: row.documentsVersion,
        acceptedTerms: row.acceptedTerms,
        acceptedPrivacy: row.acceptedPrivacy,
        acceptedAt: row.acceptedAt.toISOString(),
      })),
    };
  }

  /**
   * Updates the user's display names in Keycloak.
   */
  async updateProfile(
    user: AuthUser,
    input: UpdateProfileBody,
  ): Promise<AccountProfile> {
    const profile = await this.keycloakAdmin.updateProfile(user.id, {
      firstName: input.firstName,
      lastName: input.lastName,
    });

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
    };
  }

  /**
   * Verifies the current password, then sets a new permanent password.
   */
  async changePassword(
    user: AuthUser,
    input: ChangePasswordBody,
  ): Promise<void> {
    const email = user.email?.trim();
    if (!email) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        "Your account email is unavailable. Sign out and sign in again.",
        400,
      );
    }

    try {
      await this.keycloakTokens.passwordGrant(email, input.currentPassword);
    } catch (error) {
      if (error instanceof AppError && error.code === ErrorCode.UNAUTHORIZED) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          "Current password is incorrect",
          403,
          [{ field: "currentPassword", reason: "INVALID" }],
        );
      }
      throw error;
    }

    await this.keycloakAdmin.setPassword(user.id, input.newPassword);
  }

  /**
   * Deletes Keycloak identity and all application data for the user.
   * Identity is removed first so a failed DB cleanup cannot leave a loginable empty account.
   */
  async deleteAccount(userId: string): Promise<void> {
    await this.keycloakAdmin.deleteUser(userId);
    await this.repository.deleteUserData(userId);
  }
}
