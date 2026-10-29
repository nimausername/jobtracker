import { z } from "zod";

const optionalNonEmpty = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

/**
 * Runtime environment schema for the API process.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  /** Optional shared parent domain for auth cookies, e.g. `.nimakhabbazi.de`. */
  COOKIE_DOMAIN: optionalNonEmpty,
  /** Force Secure cookies outside production (useful behind HTTPS reverse proxies). */
  COOKIE_SECURE: z
    .enum(["true", "false", ""])
    .optional()
    .transform((value) =>
      value === "true" ? true : value === "false" ? false : undefined,
    ),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  KEYCLOAK_URL: z.string().url(),
  KEYCLOAK_REALM: z.string().min(1),
  KEYCLOAK_CLIENT_ID: z.string().min(1),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1),
  /** Optional SMTP for in-app password-reset emails (Hetzner mailbox works). */
  SMTP_HOST: optionalNonEmpty,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(["true", "false", ""])
    .optional()
    .transform((value) => value === "true"),
  SMTP_USER: optionalNonEmpty,
  SMTP_PASS: optionalNonEmpty,
  SMTP_FROM: optionalNonEmpty,
  SMTP_FROM_NAME: optionalNonEmpty,
  /** Cloudflare Turnstile (site key is public; secret stays server-side). */
  TURNSTILE_SITE_KEY: optionalNonEmpty,
  TURNSTILE_SECRET_KEY: optionalNonEmpty,
  /** Optional Redis URL for durable rate limits / login lockouts. */
  REDIS_URL: optionalNonEmpty,
});

export type Env = z.infer<typeof envSchema>;

/**
 * Normalizes alternate env names used in local/Coolify configs.
 */
const normalizeEnvAliases = (
  env: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv => {
  const next = { ...env };

  if (!next.TURNSTILE_SITE_KEY && next.TURNSTILE_SITEKEY) {
    next.TURNSTILE_SITE_KEY = next.TURNSTILE_SITEKEY;
  }
  if (!next.TURNSTILE_SECRET_KEY && next.TURNSTILE_SECRETKEY) {
    next.TURNSTILE_SECRET_KEY = next.TURNSTILE_SECRETKEY;
  }

  return next;
};

/**
 * Parses and validates process environment variables.
 */
export const loadEnv = (): Env => {
  const parsed = envSchema.safeParse(normalizeEnvAliases(process.env));

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${details}`);
  }

  return parsed.data;
};
