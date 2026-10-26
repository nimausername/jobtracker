import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

import { unauthorized } from "../lib/errors.js";
import type { AuthService } from "../services/auth/auth-service.js";

export type AuthUser = {
  readonly id: string;
  readonly email?: string;
  readonly name?: string;
};

declare module "fastify" {
  interface FastifyRequest {
    user: AuthUser;
  }
}

type AuthPluginOptions = {
  readonly authService: AuthService;
};

/**
 * Registers JWT verification helpers on the Fastify instance.
 */
const authPluginImpl: FastifyPluginAsync<AuthPluginOptions> = async (
  app,
  opts,
) => {
  const jwks = createRemoteJWKSet(new URL(opts.authService.jwksUrl));

  /**
   * Verifies Bearer access tokens and attaches `request.user`.
   */
  const authenticate = async (request: FastifyRequest): Promise<void> => {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw unauthorized("Missing bearer token");
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw unauthorized("Missing bearer token");
    }

    let payload: JWTPayload;
    try {
      const verified = await jwtVerify(token, jwks, {
        issuer: opts.authService.issuer,
      });
      payload = verified.payload;
    } catch {
      throw unauthorized("Invalid or expired token");
    }

    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      throw unauthorized("Token subject missing");
    }

    const email =
      typeof payload.email === "string"
        ? payload.email
        : typeof payload.preferred_username === "string"
          ? payload.preferred_username
          : undefined;
    const name = typeof payload.name === "string" ? payload.name : undefined;

    request.user = {
      id: payload.sub,
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    };
  };

  app.decorate("authenticate", authenticate);
  app.decorateRequest("user", {
    getter(this: FastifyRequest) {
      return (this as FastifyRequest & { _user?: AuthUser })._user as AuthUser;
    },
    setter(this: FastifyRequest, value: AuthUser) {
      (this as FastifyRequest & { _user?: AuthUser })._user = value;
    },
  });
};

export const authPlugin = fp(authPluginImpl, {
  name: "auth-plugin",
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}
