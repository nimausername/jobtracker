import cors from "@fastify/cors";
import Fastify from "fastify";

import type { Env } from "./config/env.js";
import type { Database } from "./db/client.js";
import { AppError, ErrorCode } from "./lib/errors.js";
import { resolveRequestId } from "./lib/request-id.js";
import { authPlugin } from "./plugins/auth.js";
import { ApplicationsRepository } from "./repositories/applications-repository.js";
import { NotesRepository } from "./repositories/notes-repository.js";
import { applicationsRoutes } from "./routes/applications.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";
import { notesRoutes } from "./routes/notes.js";
import { AuthService } from "./services/auth/auth-service.js";
import { ApplicationsService } from "./services/applications/applications-service.js";
import { NotesService } from "./services/notes/notes-service.js";

export type AppDeps = {
  readonly env: Env;
  readonly db: Database;
};

/**
 * Builds the Fastify application with shared plugins and routes.
 */
export const buildApp = async (deps: AppDeps) => {
  const app = Fastify({
    logger: {
      level: deps.env.NODE_ENV === "production" ? "info" : "debug",
    },
    genReqId: (request) => resolveRequestId(request.headers["x-request-id"]),
  });

  const authService = new AuthService(deps.env);
  const applicationsService = new ApplicationsService(
    new ApplicationsRepository(deps.db),
  );
  const notesService = new NotesService(new NotesRepository(deps.db));

  await app.register(cors, {
    origin: deps.env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(authPlugin, { authService });

  app.addHook("onRequest", async (request, reply) => {
    void reply.header("x-request-id", request.id);
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
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
  app.decorate("applicationsService", applicationsService);
  app.decorate("notesService", notesService);

  return app;
};

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    env: Env;
    authService: AuthService;
    applicationsService: ApplicationsService;
    notesService: NotesService;
  }
}
