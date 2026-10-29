import { and, eq, gt, isNull } from "drizzle-orm";

import type { Database } from "../db/client.js";
import { passwordResetTokens } from "../db/schema/index.js";

export type CreatePasswordResetTokenInput = {
  readonly userId: string;
  readonly email: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
};

export type PasswordResetTokenRecord = {
  readonly id: string;
  readonly userId: string;
  readonly email: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
  readonly createdAt: Date;
};

/**
 * Database access for one-time password reset tokens.
 */
export class PasswordResetTokensRepository {
  constructor(private readonly db: Database) {}

  /**
   * Invalidates unused reset tokens for a user before issuing a new one.
   */
  async invalidateActiveForUser(userId: string): Promise<void> {
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          isNull(passwordResetTokens.usedAt),
        ),
      );
  }

  /**
   * Persists a new hashed reset token.
   */
  async create(input: CreatePasswordResetTokenInput): Promise<void> {
    await this.db.insert(passwordResetTokens).values({
      userId: input.userId,
      email: input.email.toLowerCase(),
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    });
  }

  /**
   * Finds a still-valid unused token by hash.
   */
  async findActiveByHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null> {
    const rows = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Marks a token as consumed.
   */
  async markUsed(id: string): Promise<void> {
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }
}
