import type { AuthUser } from "../../plugins/auth.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { KeycloakAdminClient } from "../keycloak/admin-client.js";

/**
 * Account export and deletion use-cases.
 */
export class AccountService {
  constructor(
    private readonly repository: AccountRepository,
    private readonly keycloakAdmin: KeycloakAdminClient,
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
   * Deletes Keycloak identity and all application data for the user.
   * Identity is removed first so a failed DB cleanup cannot leave a loginable empty account.
   */
  async deleteAccount(userId: string): Promise<void> {
    await this.keycloakAdmin.deleteUser(userId);
    await this.repository.deleteUserData(userId);
  }
}
