/**
 * Standard API success envelope.
 */
export type ApiSuccess<T> = {
  readonly data: T;
  readonly meta: {
    readonly requestId: string;
  };
};

/**
 * Standard API error envelope.
 */
export type ApiErrorBody = {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details: ReadonlyArray<{
      readonly field?: string;
      readonly reason: string;
    }>;
  };
  readonly meta: {
    readonly requestId: string;
  };
};

/**
 * Tokens returned by auth endpoints.
 */
export type AuthTokens = {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly refreshExpiresIn: number;
  readonly tokenType: string;
};

/**
 * Current authenticated user profile.
 */
export type AuthUser = {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
};
