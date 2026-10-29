import { createTransport, type Transporter } from "nodemailer";

import type { Env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";

export type SendMailInput = {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
};

const SMTP_TIMEOUT_MS = 12_000;

/**
 * Returns whether SMTP env is complete enough to send mail.
 */
export const isSmtpConfigured = (env: Env): boolean =>
  Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);

/**
 * Thin SMTP wrapper for transactional auth emails.
 */
export class SmtpMailer {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly host: string;
  private readonly port: number;

  constructor(env: Env) {
    if (!isSmtpConfigured(env)) {
      throw new AppError(
        "INTERNAL",
        "SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
        500,
      );
    }

    this.host = env.SMTP_HOST!;
    this.port = env.SMTP_PORT;
    this.from = env.SMTP_FROM_NAME
      ? `${env.SMTP_FROM_NAME} <${env.SMTP_FROM!}>`
      : env.SMTP_FROM!;

    // 465 = implicit TLS (secure:true). 587 = plain then STARTTLS (secure:false).
    // Mis-setting SMTP_SECURE=true on 587 causes OpenSSL "wrong version number".
    const useImplicitTls =
      env.SMTP_PORT === 465 ? true : env.SMTP_PORT === 587 ? false : env.SMTP_SECURE;

    this.transporter = createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: useImplicitTls,
      requireTLS: !useImplicitTls,
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  /**
   * Sends a transactional email through the configured SMTP mailbox.
   */
  async send(input: SendMailInput): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Unknown SMTP error";
      throw new AppError(
        "INTERNAL",
        `Unable to send email via ${this.host}:${this.port}. ${detail}`,
        502,
        [{ field: "email", reason: "SMTP_SEND_FAILED" }],
      );
    }
  }
}
