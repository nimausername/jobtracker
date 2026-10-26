import type { FastifyPluginAsync } from "fastify";

import { parseOrThrow } from "../lib/validate.js";
import { createNoteBodySchema } from "../schemas/notes.js";
import type { NotesService } from "../services/notes/notes-service.js";

type NotesRouteOptions = {
  readonly notesService: NotesService;
};

/**
 * Nested notes routes under applications.
 */
export const notesRoutes: FastifyPluginAsync<NotesRouteOptions> = async (
  app,
  opts,
) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/applications/:applicationId/notes", async (request) => {
    const { applicationId } = request.params as { applicationId: string };
    const data = await opts.notesService.list(request.user.id, applicationId);
    return {
      data,
      meta: { requestId: request.id },
    };
  });

  app.post("/applications/:applicationId/notes", async (request, reply) => {
    const { applicationId } = request.params as { applicationId: string };
    const body = parseOrThrow(createNoteBodySchema, request.body);
    const data = await opts.notesService.create(
      request.user.id,
      applicationId,
      body,
    );
    return reply.status(201).send({
      data,
      meta: { requestId: request.id },
    });
  });

  app.delete(
    "/applications/:applicationId/notes/:noteId",
    async (request, reply) => {
      const { applicationId, noteId } = request.params as {
        applicationId: string;
        noteId: string;
      };
      await opts.notesService.delete(request.user.id, applicationId, noteId);
      return reply.status(204).send();
    },
  );
};
