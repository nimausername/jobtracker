import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import {
  clearAuthCookies,
  readAuthCookies,
  setAuthCookies,
} from "../lib/auth-cookies.js";
import { resolveClientIp } from "../lib/client-ip.js";
import { AppError, badRequest, ErrorCode } from "../lib/errors.js";
import {
  loginThrottle,
  loginThrottleKey,
} from "../lib/login-throttle.js";
import { parseOrThrow } from "../lib/validate.js";
import { authRateLimits } from "../plugins/security.js";
import {
  loginBodySchema,
  registerBodySchema,
} from "../schemas/auth.js";
import type { AuthService } from "../services/auth/auth-service.js";
import type { TokenResponse } from "../services/keycloak/token-client.js";

type AuthRouteOptions = {
  readonly authService: AuthService;
};

const refreshBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

const toAuthSession = (tokens: TokenResponse) => ({
  authenticated: true as const,
  expiresIn: tokens.expiresIn,
  refreshExpiresIn: tokens.refreshExpiresIn,
  tokenType: tokens.tokenType,
});

/**
 * Auth routes: register, login, refresh, logout, and current user.
 * Tokens are stored in httpOnly cookies; JSON only returns session metadata.
 */
export const authRoutes: FastifyPluginAsync<AuthRouteOptions> = async (
  app,
  opts,
) => {
  app.post(
    "/auth/register",
    {
      config: {
        rateLimit: authRateLimits.register,
      },
    },
    async (request, reply) => {
      const body = parseOrThrow(registerBodySchema, request.body);
      const ipAddress = resolveClientIp(request);
      const userAgentHeader = request.headers["user-agent"];
      const userAgent =
        typeof userAgentHeader === "string" ? userAgentHeader : undefined;

      const tokens = await opts.authService.register({
        email: body.email,
        password: body.password,
        acceptedLegal: body.acceptedLegal,
        documentsVersion: body.documentsVersion,
        ...(body.name ? { name: body.name } : {}),
        ...(ipAddress ? { ipAddress } : {}),
        ...(userAgent ? { userAgent } : {}),
      });

      setAuthCookies(reply, tokens, app.env);

      return reply.status(201).send({
        data: toAuthSession(tokens),
        meta: { requestId: request.id },
      });
    },
  );

  app.post(
    "/auth/login",
    {
      config: {
        rateLimit: authRateLimits.login,
      },
    },
    async (request, reply) => {
      const body = parseOrThrow(loginBodySchema, request.body);
      const ip = resolveClientIp(request);
      const throttleKey = loginThrottleKey(body.email, ip);

      loginThrottle.assertAllowed(throttleKey);

      try {
        const tokens = await opts.authService.login(body);
        loginThrottle.recordSuccess(throttleKey);
        setAuthCookies(reply, tokens, app.env);

        return {
          data: toAuthSession(tokens),
          meta: { requestId: request.id },
        };
      } catch (error) {
        if (
          error instanceof AppError &&
          error.code === ErrorCode.UNAUTHORIZED
        ) {
          loginThrottle.recordFailure(throttleKey);
        }
        throw error;
      }
    },
  );

  app.post(
    "/auth/refresh",
    {
      config: {
        rateLimit: authRateLimits.refresh,
      },
    },
    async (request, reply) => {
      const body = parseOrThrow(refreshBodySchema, request.body ?? {});
      const cookieRefresh = readAuthCookies(request).refreshToken;
      const refreshToken = body.refreshToken ?? cookieRefresh;

      if (!refreshToken) {
        throw badRequest("Refresh token missing", [
          { field: "refreshToken", reason: "REQUIRED" },
        ]);
      }

      const tokens = await opts.authService.refresh(refreshToken);
      setAuthCookies(reply, tokens, app.env);

      return {
        data: toAuthSession(tokens),
        meta: { requestId: request.id },
      };
    },
  );

  app.post(
    "/auth/logout",
    {
      config: {
        rateLimit: authRateLimits.logout,
      },
    },
    async (request, reply) => {
      const refreshToken = readAuthCookies(request).refreshToken;
      if (refreshToken) {
        try {
          await opts.authService.logout(refreshToken);
        } catch (error) {
          request.log.warn({ err: error }, "Keycloak logout revoke failed");
        }
      }

      clearAuthCookies(reply, app.env);

      return reply.status(204).send();
    },
  );

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
