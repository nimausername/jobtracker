# Contributing to Job Tracker

Thanks for helping improve Job Tracker. This guide keeps contributions consistent
and safe for an open-source, self-hosted project.

## Development setup

1. Fork and clone the repository.
2. Install Node.js 20+ and pnpm 9+.
3. Copy environment files:

   ```bash
   cp .env.example .env
   cp .env.example frontend/.env.local
   ```

   Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `frontend/.env.local`.

4. Start Postgres (optional local):

   ```bash
   docker compose up -d
   ```

5. Install and migrate:

   ```bash
   pnpm install
   pnpm db:migrate
   pnpm dev
   ```

6. Configure Keycloak as described in the README (realm, confidential client,
   Direct Access Grants, service account `manage-users` / `view-users`).

## Project layout

| Path | Responsibility |
| --- | --- |
| `frontend/` | Next.js UI (shadcn) |
| `backend/` | Fastify API, Zod validation, Drizzle |
| `docker-compose.yml` | Local Postgres for contributors |

Keep frontend and backend boundaries clean:

- Routes stay thin.
- Business rules live in services.
- Database access lives in repositories.
- Backend RBAC / ownership checks are the source of truth.

## Coding standards

- TypeScript strict mode; avoid `any`.
- Prefer Zod schemas for request validation and inferred types.
- Use camelCase in API JSON.
- Follow existing folder and naming patterns.
- Add or update tests for high-risk behavior (auth isolation, ownership).

## Checks before you open a PR

From the repo root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Pull requests

1. Create a focused branch (`feat/...`, `fix/...`, `docs/...`).
2. Keep the PR small and describe the why.
3. Include a short test plan in the PR body.
4. Do not commit secrets (`.env`, client secrets, database passwords).

## Security reports

Do not open a public issue for vulnerabilities. See [SECURITY.md](SECURITY.md).
