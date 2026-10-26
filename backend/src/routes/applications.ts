import type { FastifyPluginAsync } from "fastify";

import { parseOrThrow } from "../lib/validate.js";
import {
  createApplicationBodySchema,
  listApplicationsQuerySchema,
  updateApplicationBodySchema,
} from "../schemas/applications.js";
import type { ApplicationsService } from "../services/applications/applications-service.js";

type ApplicationsRouteOptions = {
  readonly applicationsService: ApplicationsService;
};

/**
 * Authenticated application resource routes.
 */
export const applicationsRoutes: FastifyPluginAsync<
  ApplicationsRouteOptions
> = async (app, opts) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/applications/summary", async (request) => {
    const data = await opts.applicationsService.summary(request.user.id);
    return {
      data,
      meta: { requestId: request.id },
    };
  });

  app.get("/applications", async (request) => {
    const query = parseOrThrow(listApplicationsQuerySchema, request.query);
    const data = await opts.applicationsService.list(request.user.id, query);
    return {
      data: data.items,
      meta: {
        requestId: request.id,
        nextCursor: data.nextCursor,
      },
    };
  });

  app.post("/applications", async (request, reply) => {
    const body = parseOrThrow(createApplicationBodySchema, request.body);
    const data = await opts.applicationsService.create(request.user.id, body);
    return reply.status(201).send({
      data,
      meta: { requestId: request.id },
    });
  });

  app.get("/applications/:id", async (request) => {
    const { id } = request.params as { id: string };
    const data = await opts.applicationsService.getById(request.user.id, id);
    return {
      data,
      meta: { requestId: request.id },
    };
  });

  app.patch("/applications/:id", async (request) => {
    const { id } = request.params as { id: string };
    const body = parseOrThrow(updateApplicationBodySchema, request.body);
    const data = await opts.applicationsService.update(
      request.user.id,
      id,
      body,
    );
    return {
      data,
      meta: { requestId: request.id },
    };
  });

  app.delete("/applications/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await opts.applicationsService.delete(request.user.id, id);
    return reply.status(204).send();
  });
};
