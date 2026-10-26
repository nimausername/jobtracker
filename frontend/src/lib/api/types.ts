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
 * Session metadata returned by auth endpoints (tokens live in httpOnly cookies).
 */
export type AuthSession = {
  readonly authenticated: true;
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

/**
 * Portable account export payload.
 */
export type AccountExport = {
  readonly exportedAt: string;
  readonly user: {
    readonly id: string;
    readonly email: string | null;
    readonly name: string | null;
  };
  readonly applications: ReadonlyArray<Record<string, unknown>>;
  readonly applicationNotes: ReadonlyArray<Record<string, unknown>>;
  readonly legalAcceptances: ReadonlyArray<Record<string, unknown>>;
};
