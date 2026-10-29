import type { Env } from "../../config/env.js";
import { AppError, ErrorCode } from "../../lib/errors.js";

type SiteverifyResponse = {
  readonly success?: boolean;
  readonly "error-codes"?: readonly string[];
  readonly action?: string;
  readonly hostname?: string;
};

/**
 * Verifies a Cloudflare Turnstile token with Siteverify.
 * No-ops when Turnstile is not configured (local/dev without keys).
 */
export const verifyTurnstileToken = async (input: {
  readonly env: Env;
  readonly token: string | undefined;
  readonly remoteIp?: string;
  readonly expectedAction?: string;
}): Promise<void> => {
  if (!input.env.TURNSTILE_SECRET_KEY) {
    return;
  }

  if (!input.token?.trim()) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      "Complete the security check and try again.",
      403,
      [{ field: "turnstileToken", reason: "REQUIRED" }],
    );
  }

  const body = new URLSearchParams({
    secret: input.env.TURNSTILE_SECRET_KEY,
    response: input.token.trim(),
  });

  if (input.remoteIp) {
    body.set("remoteip", input.remoteIp);
  }

  let result: SiteverifyResponse;
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );
    result = (await response.json()) as SiteverifyResponse;
  } catch {
    throw new AppError(
      ErrorCode.INTERNAL,
      "Unable to verify the security check. Please try again.",
      502,
      [{ field: "turnstileToken", reason: "VERIFY_FAILED" }],
    );
  }

  if (result.success !== true) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      "Security check failed. Please try again.",
      403,
      [{ field: "turnstileToken", reason: "INVALID" }],
    );
  }

  if (
    input.expectedAction &&
    result.action &&
    result.action !== input.expectedAction
  ) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      "Security check failed. Please try again.",
      403,
      [{ field: "turnstileToken", reason: "ACTION_MISMATCH" }],
    );
  }
};
