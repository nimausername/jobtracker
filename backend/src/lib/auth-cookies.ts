import type { FastifyReply, FastifyRequest } from "fastify";

import type { Env } from "../config/env.js";
import type { TokenResponse } from "../services/keycloak/token-client.js";

export const ACCESS_COOKIE = "jt_access";
export const REFRESH_COOKIE = "jt_refresh";

type CookieOptions = {
  readonly maxAgeSeconds: number;
  readonly env: Env;
};

/**
 * Builds a single Set-Cookie header value.
 */
const serializeCookie = (
  name: string,
  value: string,
  options: CookieOptions,
): string => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`,
  ];

  if (options.env.NODE_ENV === "production" || options.env.COOKIE_SECURE) {
    parts.push("Secure");
  }

  if (options.env.COOKIE_DOMAIN) {
    parts.push(`Domain=${options.env.COOKIE_DOMAIN}`);
  }

  return parts.join("; ");
};

/**
 * Parses a Cookie header into a name → value map.
 */
export const parseCookieHeader = (
  header: string | undefined,
): Record<string, string> => {
  if (!header) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }

    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }

    const name = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    try {
      result[name] = decodeURIComponent(raw);
    } catch {
      result[name] = raw;
    }
  }

  return result;
};

/**
 * Reads auth cookies from the request.
 */
export const readAuthCookies = (
  request: FastifyRequest,
): { accessToken?: string; refreshToken?: string } => {
  const cookies = parseCookieHeader(request.headers.cookie);
  return {
    ...(cookies[ACCESS_COOKIE] ? { accessToken: cookies[ACCESS_COOKIE] } : {}),
    ...(cookies[REFRESH_COOKIE]
      ? { refreshToken: cookies[REFRESH_COOKIE] }
      : {}),
  };
};

/**
 * Sets httpOnly auth cookies from a Keycloak token response.
 */
export const setAuthCookies = (
  reply: FastifyReply,
  tokens: TokenResponse,
  env: Env,
): void => {
  reply.header("Set-Cookie", [
    serializeCookie(ACCESS_COOKIE, tokens.accessToken, {
      maxAgeSeconds: tokens.expiresIn,
      env,
    }),
    serializeCookie(REFRESH_COOKIE, tokens.refreshToken, {
      maxAgeSeconds: tokens.refreshExpiresIn,
      env,
    }),
  ]);
};

/**
 * Clears auth cookies (logout / account deletion).
 */
export const clearAuthCookies = (reply: FastifyReply, env: Env): void => {
  reply.header("Set-Cookie", [
    serializeCookie(ACCESS_COOKIE, "", { maxAgeSeconds: 0, env }),
    serializeCookie(REFRESH_COOKIE, "", { maxAgeSeconds: 0, env }),
  ]);
};
