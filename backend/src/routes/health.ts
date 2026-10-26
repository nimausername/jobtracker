import type { FastifyPluginAsync } from "fastify";

/**
 * Liveness and readiness endpoints.
 */
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async (request) => {
    return {
      data: {
        status: "ok",
        service: "jobtracker-api",
      },
      meta: {
        requestId: request.id,
      },
    };
  });
};
