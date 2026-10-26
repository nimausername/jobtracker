import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

/**
 * Loads key=value pairs from the repo root `.env` when not already set.
 */
const loadRootEnv = (): void => {
  try {
    const envPath = resolve(process.cwd(), "../.env");
    const content = readFileSync(envPath, "utf8");

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Root `.env` is optional for schema-only generate when DATABASE_URL is exported.
  }
};

loadRootEnv();

/**
 * Drizzle Kit configuration.
 * Migrations run against DATABASE_URL from the repo root `.env`.
 */
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
