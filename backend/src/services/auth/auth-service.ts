import { createHash, randomBytes } from "node:crypto";

import type { Env } from "../../config/env.js";
import { badRequest } from "../../lib/errors.js";
import { LEGAL_DOCUMENTS_VERSION } from "../../lib/legal-documents.js";
import type { LegalAcceptancesRepository } from "../../repositories/legal-acceptances-repository.js";
import type { PasswordResetTokensRepository } from "../../repositories/password-reset-tokens-repository.js";
import { KeycloakAdminClient } from "../keycloak/admin-client.js";
import {
  KeycloakTokenClient,
  type TokenResponse,
} from "../keycloak/token-client.js";
import { createKeycloakUrls } from "../keycloak/urls.js";
import {
  isSmtpConfigured,
  SmtpMailer,
} from "../mail/smtp-mailer.js";

export type RegisterInput = {
  readonly email: string;
  readonly password: string;
  readonly firstName?: string;
  readonly lastName?: string;
  /** @deprecated Prefer firstName + lastName. */
  readonly name?: string;
  readonly acceptedLegal: true;
  readonly documentsVersion: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
};

export type RegisterResult = {
  readonly created: true;
};

export type ForgotPasswordInput = {
  readonly email: string;
};

export type ForgotPasswordResult = {
  readonly sent: true;
};

export type ResetPasswordInput = {
  readonly token: string;
  readonly password: string;
};

export type ResetPasswordResult = {
  readonly reset: true;
};

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

export type AuthResult = TokenResponse & {
  readonly userId: string;
};

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60 * 12;

const hashResetToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

/**
 * Application auth use-cases backed by Keycloak.
 */
export class AuthService {
  private readonly tokenClient: KeycloakTokenClient;
  private readonly adminClient: KeycloakAdminClient;
  private readonly mailer: SmtpMailer | null;
  private readonly appOrigin: string;
  readonly issuer: string;
  readonly jwksUrl: string;

  constructor(
    env: Env,
    private readonly legalAcceptancesRepository: LegalAcceptancesRepository,
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
  ) {
    const urls = createKeycloakUrls(env);
    this.tokenClient = new KeycloakTokenClient(env, urls);
    this.adminClient = new KeycloakAdminClient(urls, this.tokenClient);
    this.mailer = isSmtpConfigured(env) ? new SmtpMailer(env) : null;
    this.appOrigin = env.CORS_ORIGIN.replace(/\/$/, "");
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
      ...(input.firstName ? { firstName: input.firstName } : {}),
      ...(input.lastName ? { lastName: input.lastName } : {}),
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
   * Emails an in-app password-reset link when the account exists.
   * Always returns the same shape to avoid account enumeration.
   */
  async forgotPassword(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordResult> {
    if (!this.mailer) {
      throw badRequest(
        "Password reset email is not configured yet. Contact the operator.",
        [{ field: "email", reason: "SMTP_NOT_CONFIGURED" }],
      );
    }

    const email = input.email.toLowerCase();
    const userId = await this.adminClient.findUserIdByEmailAddress(email);

    if (!userId) {
      return { sent: true };
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await this.passwordResetTokensRepository.invalidateActiveForUser(userId);
    await this.passwordResetTokensRepository.create({
      userId,
      email,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${this.appOrigin}/reset-password?token=${encodeURIComponent(token)}`;

    await this.mailer.send({
      to: email,
      subject: "Reset your Job Tracker password",
      text: [
        "Reset your Job Tracker password using this link:",
        resetUrl,
        "",
        "This link expires in 12 hours. If you did not request a reset, you can ignore this email.",
      ].join("\n"),
      html: `
        <p>Reset your Job Tracker password using this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 12 hours. If you did not request a reset, you can ignore this email.</p>
      `.trim(),
    });

    return { sent: true };
  }

  /**
   * Consumes a reset token and sets a new Keycloak password in-app.
   */
  async resetPassword(
    input: ResetPasswordInput,
  ): Promise<ResetPasswordResult> {
    const tokenHash = hashResetToken(input.token);
    const record =
      await this.passwordResetTokensRepository.findActiveByHash(tokenHash);

    if (!record) {
      throw badRequest("This reset link is invalid or has expired.", [
        { field: "token", reason: "INVALID" },
      ]);
    }

    await this.adminClient.setPassword(record.userId, input.password);
    await this.passwordResetTokensRepository.markUsed(record.id);

    return { reset: true };
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
