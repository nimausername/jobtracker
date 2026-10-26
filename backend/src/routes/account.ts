import type { FastifyPluginAsync } from "fastify";

import { clearAuthCookies } from "../lib/auth-cookies.js";
import { parseOrThrow } from "../lib/validate.js";
import { deleteAccountBodySchema } from "../schemas/account.js";
import type { AccountService } from "../services/account/account-service.js";

type AccountRouteOptions = {
  readonly accountService: AccountService;
};

/**
 * Authenticated account export and self-serve deletion.
 */
export const accountRoutes: FastifyPluginAsync<AccountRouteOptions> = async (
  app,
  opts,
) => {
  app.get(
    "/account/export",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      const data = await opts.accountService.exportData(request.user);

      return {
        data,
        meta: { requestId: request.id },
      };
    },
  );

  app.delete(
    "/account",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      parseOrThrow(deleteAccountBodySchema, request.body);
      await opts.accountService.deleteAccount(request.user.id);
      clearAuthCookies(reply, app.env);

      return reply.status(204).send();
    },
  );
};
