import cors from "@fastify/cors";
import Fastify from "fastify";

import type { Env } from "./config/env.js";
import type { Database } from "./db/client.js";
import { AppError, ErrorCode } from "./lib/errors.js";
import { configureAuthThrottles } from "./lib/login-throttle.js";
import { createRedisClient } from "./lib/redis.js";
import { resolveRequestId } from "./lib/request-id.js";
import { authPlugin } from "./plugins/auth.js";
import { securityPlugin } from "./plugins/security.js";
import { AccountRepository } from "./repositories/account-repository.js";
import { ApplicationsRepository } from "./repositories/applications-repository.js";
import { LegalAcceptancesRepository } from "./repositories/legal-acceptances-repository.js";
import { NotesRepository } from "./repositories/notes-repository.js";
import { PasswordResetTokensRepository } from "./repositories/password-reset-tokens-repository.js";
import { accountRoutes } from "./routes/account.js";
import { applicationsRoutes } from "./routes/applications.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";
import { notesRoutes } from "./routes/notes.js";
import { AccountService } from "./services/account/account-service.js";
import { AuthService } from "./services/auth/auth-service.js";
import { ApplicationsService } from "./services/applications/applications-service.js";
import { KeycloakAdminClient } from "./services/keycloak/admin-client.js";
import { KeycloakTokenClient } from "./services/keycloak/token-client.js";
import { createKeycloakUrls } from "./services/keycloak/urls.js";
import { NotesService } from "./services/notes/notes-service.js";

export type AppDeps = {
  readonly env: Env;
  readonly db: Database;
};

type RateLimitErrorShape = {
  readonly statusCode?: number;
  readonly code?: string;
  readonly message?: string;
  readonly retryAfterSeconds?: number;
};

/**
 * Builds the Fastify application with shared plugins and routes.
 */
export const buildApp = async (deps: AppDeps) => {
  const app = Fastify({
    logger: {
      level: deps.env.NODE_ENV === "production" ? "info" : "debug",
    },
    // Coolify / reverse proxy: use X-Forwarded-* for client IP (rate limits).
    trustProxy: true,
    // Cap JSON bodies to reduce abuse via oversized payloads.
    bodyLimit: 64 * 1024,
    genReqId: (request) => resolveRequestId(request.headers["x-request-id"]),
  });

  const authService = new AuthService(
    deps.env,
    new LegalAcceptancesRepository(deps.db),
    new PasswordResetTokensRepository(deps.db),
  );
  const notesRepository = new NotesRepository(deps.db);
  const applicationsService = new ApplicationsService(
    new ApplicationsRepository(deps.db),
    notesRepository,
  );
  const notesService = new NotesService(notesRepository);

  const keycloakUrls = createKeycloakUrls(deps.env);
  const keycloakTokenClient = new KeycloakTokenClient(deps.env, keycloakUrls);
  const accountService = new AccountService(
    new AccountRepository(deps.db),
    new KeycloakAdminClient(keycloakUrls, keycloakTokenClient),
    keycloakTokenClient,
  );

  const redis = await createRedisClient(deps.env, app.log);
  configureAuthThrottles(redis);

  if (redis) {
    app.log.info("Redis connected — durable rate limits enabled");
    app.addHook("onClose", async () => {
      await redis.quit();
    });
  } else if (deps.env.REDIS_URL) {
    app.log.warn(
      "REDIS_URL is set but Redis auth/connection failed — using in-memory limits",
    );
  }

  await app.register(cors, {
    origin: deps.env.CORS_ORIGIN,
    credentials: true,
    // @fastify/cors defaults to GET,HEAD,POST only — PATCH/DELETE need an explicit allow-list.
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(securityPlugin, { redis });
  await app.register(authPlugin, { authService });

  app.addHook("onRequest", async (request, reply) => {
    void reply.header("x-request-id", request.id);
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      if (error.retryAfterSeconds !== undefined) {
        void reply.header("Retry-After", String(error.retryAfterSeconds));
      }

      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta: {
          requestId: request.id,
        },
      });
    }

    const rateLimitError = error as RateLimitErrorShape;
    if (rateLimitError.statusCode === 429) {
      const retryAfterSeconds = rateLimitError.retryAfterSeconds;
      if (retryAfterSeconds !== undefined) {
        void reply.header("Retry-After", String(retryAfterSeconds));
      }

      return reply.status(429).send({
        error: {
          code: ErrorCode.RATE_LIMITED,
          message:
            rateLimitError.message ??
            "Too many requests. Please slow down and try again.",
          details: [],
        },
        meta: {
          requestId: request.id,
        },
      });
    }

    request.log.error({ err: error }, "Unhandled error");

    return reply.status(500).send({
      error: {
        code: ErrorCode.INTERNAL,
        message: "Internal server error",
        details: [],
      },
      meta: {
        requestId: request.id,
      },
    });
  });

  await app.register(healthRoutes, { prefix: "/v1" });
  await app.register(authRoutes, { prefix: "/v1", authService });
  await app.register(accountRoutes, { prefix: "/v1", accountService });
  await app.register(applicationsRoutes, {
    prefix: "/v1",
    applicationsService,
  });
  await app.register(notesRoutes, {
    prefix: "/v1",
    notesService,
  });

  app.decorate("db", deps.db);
  app.decorate("env", deps.env);
  app.decorate("authService", authService);
  app.decorate("accountService", accountService);
  app.decorate("applicationsService", applicationsService);
  app.decorate("notesService", notesService);

  return app;
};

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    env: Env;
    authService: AuthService;
    accountService: AccountService;
    applicationsService: ApplicationsService;
    notesService: NotesService;
  }
}
