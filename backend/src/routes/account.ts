import type { FastifyPluginAsync } from "fastify";

import { clearAuthCookies } from "../lib/auth-cookies.js";
import { parseOrThrow } from "../lib/validate.js";
import { accountRateLimits } from "../plugins/security.js";
import {
  changePasswordBodySchema,
  deleteAccountBodySchema,
  updateProfileBodySchema,
} from "../schemas/account.js";
import type { AccountService } from "../services/account/account-service.js";

type AccountRouteOptions = {
  readonly accountService: AccountService;
};

/**
 * Authenticated account profile, password, export, and self-serve deletion.
 */
export const accountRoutes: FastifyPluginAsync<AccountRouteOptions> = async (
  app,
  opts,
) => {
  app.patch(
    "/account/profile",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: accountRateLimits.updateProfile,
      },
    },
    async (request) => {
      const body = parseOrThrow(updateProfileBodySchema, request.body);
      const data = await opts.accountService.updateProfile(request.user, body);

      return {
        data,
        meta: { requestId: request.id },
      };
    },
  );

  app.post(
    "/account/password",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: accountRateLimits.changePassword,
      },
    },
    async (request, reply) => {
      const body = parseOrThrow(changePasswordBodySchema, request.body);
      await opts.accountService.changePassword(request.user, body);

      return reply.status(204).send();
    },
  );

  app.get(
    "/account/export",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: accountRateLimits.export,
      },
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
      config: {
        rateLimit: accountRateLimits.delete,
      },
    },
    async (request, reply) => {
      parseOrThrow(deleteAccountBodySchema, request.body);
      await opts.accountService.deleteAccount(request.user.id);
      clearAuthCookies(reply, app.env);

      return reply.status(204).send();
    },
  );
};
