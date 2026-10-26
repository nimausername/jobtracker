import type { Database } from "../db/client.js";
import { legalAcceptances } from "../db/schema/index.js";

export type CreateLegalAcceptanceInput = {
  readonly userId: string;
  readonly email: string;
  readonly documentsVersion: string;
  readonly acceptedTerms: boolean;
  readonly acceptedPrivacy: boolean;
  readonly ipAddress?: string;
  readonly userAgent?: string;
};

/**
 * Database access for Terms/Privacy acceptance records.
 */
export class LegalAcceptancesRepository {
  constructor(private readonly db: Database) {}

  /**
   * Persists a registration-time legal acceptance.
   */
  async create(input: CreateLegalAcceptanceInput): Promise<void> {
    await this.db.insert(legalAcceptances).values({
      userId: input.userId,
      email: input.email.toLowerCase(),
      documentsVersion: input.documentsVersion,
      acceptedTerms: input.acceptedTerms,
      acceptedPrivacy: input.acceptedPrivacy,
      ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
      ...(input.userAgent ? { userAgent: input.userAgent } : {}),
    });
  }
}
