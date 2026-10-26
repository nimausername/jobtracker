import { afterEach, describe, expect, it } from "vitest";

import { loadEnv } from "./env.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("loadEnv", () => {
  it("parses a valid environment", () => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: "postgresql://user:pass@localhost:5432/jobtracker",
      KEYCLOAK_URL: "https://auth.example.com",
      KEYCLOAK_REALM: "jobtracker",
      KEYCLOAK_CLIENT_ID: "jobtracker-api",
      KEYCLOAK_CLIENT_SECRET: "secret",
      PORT: "4000",
      CORS_ORIGIN: "http://localhost:3000",
      NODE_ENV: "test",
    };

    const env = loadEnv();

    expect(env.PORT).toBe(4000);
    expect(env.KEYCLOAK_REALM).toBe("jobtracker");
  });

  it("throws when required values are missing", () => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: undefined,
      KEYCLOAK_URL: undefined,
      KEYCLOAK_REALM: undefined,
      KEYCLOAK_CLIENT_ID: undefined,
      KEYCLOAK_CLIENT_SECRET: undefined,
    };

    expect(() => loadEnv()).toThrow(/Invalid environment/);
  });
});
