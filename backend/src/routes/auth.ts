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
  forgotPasswordThrottle,
  loginThrottle,
  loginThrottleKey,
} from "../lib/login-throttle.js";
import { emailThrottleKey } from "../lib/attempt-throttle.js";
import { parseOrThrow } from "../lib/validate.js";
import { authRateLimits } from "../plugins/security.js";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from "../schemas/auth.js";
import type { AuthService } from "../services/auth/auth-service.js";
import type { TokenResponse } from "../services/keycloak/token-client.js";
import { verifyTurnstileToken } from "../services/turnstile/verify-turnstile.js";

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
  app.get("/auth/public-config", async (request) => {
    return {
      data: {
        turnstileSiteKey: app.env.TURNSTILE_SITE_KEY ?? null,
        turnstileEnabled: Boolean(app.env.TURNSTILE_SECRET_KEY),
      },
      meta: { requestId: request.id },
    };
  });

  app.post(
    "/auth/forgot-password",
    {
      config: {
        rateLimit: authRateLimits.forgotPassword,
      },
    },
    async (request) => {
      const body = parseOrThrow(forgotPasswordBodySchema, request.body);
      const ip = resolveClientIp(request);
      const emailKey = emailThrottleKey(body.email);

      await forgotPasswordThrottle.assertAllowed(emailKey);
      await verifyTurnstileToken({
        env: app.env,
        token: body.turnstileToken,
        remoteIp: ip,
        expectedAction: "forgot-password",
      });

      // Count every request toward the per-email budget (including successful sends).
      await forgotPasswordThrottle.recordFailure(emailKey);

      try {
        const result = await opts.authService.forgotPassword({
          email: body.email,
        });

        return {
          data: result,
          meta: { requestId: request.id },
        };
      } catch (error) {
        request.log.error(
          { err: error, email: body.email },
          "Forgot-password request failed",
        );
        throw error;
      }
    },
  );

  app.post(
    "/auth/reset-password",
    {
      config: {
        rateLimit: authRateLimits.resetPassword,
      },
    },
    async (request) => {
      const body = parseOrThrow(resetPasswordBodySchema, request.body);
      const result = await opts.authService.resetPassword({
        token: body.token,
        password: body.password,
      });

      return {
        data: result,
        meta: { requestId: request.id },
      };
    },
  );

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

      await verifyTurnstileToken({
        env: app.env,
        token: body.turnstileToken,
        remoteIp: ipAddress,
        expectedAction: "register",
      });

      const result = await opts.authService.register({
        email: body.email,
        password: body.password,
        acceptedLegal: body.acceptedLegal,
        documentsVersion: body.documentsVersion,
        ...(body.firstName ? { firstName: body.firstName } : {}),
        ...(body.lastName ? { lastName: body.lastName } : {}),
        ...(body.name ? { name: body.name } : {}),
        ...(ipAddress ? { ipAddress } : {}),
        ...(userAgent ? { userAgent } : {}),
      });

      return reply.status(201).send({
        data: result,
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

      await loginThrottle.assertAllowed(throttleKey);
      await verifyTurnstileToken({
        env: app.env,
        token: body.turnstileToken,
        remoteIp: ip,
        expectedAction: "login",
      });

      try {
        const tokens = await opts.authService.login({
          email: body.email,
          password: body.password,
        });
        await loginThrottle.recordSuccess(throttleKey);
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
          await loginThrottle.recordFailure(throttleKey);
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
          firstName: request.user.firstName ?? null,
          lastName: request.user.lastName ?? null,
        },
        meta: { requestId: request.id },
      };
    },
  );
};
