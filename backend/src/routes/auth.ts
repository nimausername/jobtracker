import type { FastifyPluginAsync } from "fastify";

import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "../schemas/auth.js";
import { parseOrThrow } from "../lib/validate.js";
import type { AuthService } from "../services/auth/auth-service.js";
import type { TokenResponse } from "../services/keycloak/token-client.js";

type AuthRouteOptions = {
  readonly authService: AuthService;
};

const toAuthData = (tokens: TokenResponse) => ({
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  expiresIn: tokens.expiresIn,
  refreshExpiresIn: tokens.refreshExpiresIn,
  tokenType: tokens.tokenType,
});

/**
 * Auth routes: register, login, refresh, and current user.
 */
export const authRoutes: FastifyPluginAsync<AuthRouteOptions> = async (
  app,
  opts,
) => {
  app.post("/auth/register", async (request, reply) => {
    const body = parseOrThrow(registerBodySchema, request.body);
    const tokens = await opts.authService.register({
      email: body.email,
      password: body.password,
      ...(body.name ? { name: body.name } : {}),
    });

    return reply.status(201).send({
      data: toAuthData(tokens),
      meta: { requestId: request.id },
    });
  });

  app.post("/auth/login", async (request) => {
    const body = parseOrThrow(loginBodySchema, request.body);
    const tokens = await opts.authService.login(body);

    return {
      data: toAuthData(tokens),
      meta: { requestId: request.id },
    };
  });

  app.post("/auth/refresh", async (request) => {
    const body = parseOrThrow(refreshBodySchema, request.body);
    const tokens = await opts.authService.refresh(body.refreshToken);

    return {
      data: toAuthData(tokens),
      meta: { requestId: request.id },
    };
  });

  app.get(
    "/auth/me",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      return {
        data: {
          id: request.user.id,
          email: request.user.email ?? null,
          name: request.user.name ?? null,
        },
        meta: { requestId: request.id },
      };
    },
  );
};
