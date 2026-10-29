import { createTransport, type Transporter } from "nodemailer";

import type { Env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";

export type SendMailInput = {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
};

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

  constructor(env: Env) {
    if (!isSmtpConfigured(env)) {
      throw new AppError(
        "INTERNAL",
        "SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
        500,
      );
    }

    this.from = env.SMTP_FROM_NAME
      ? `${env.SMTP_FROM_NAME} <${env.SMTP_FROM!}>`
      : env.SMTP_FROM!;

    this.transporter = createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
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
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
