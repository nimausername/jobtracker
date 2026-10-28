# Job Tracker

[![CI](https://github.com/nimausername/jobtracker/actions/workflows/ci.yml/badge.svg)](https://github.com/nimausername/jobtracker/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Self-hosted job application tracker.** Keep every application — wishlist → applied → interview → offer — in one clean pipeline, with a timeline of notes on each role.

Built as an open-source monorepo: Next.js UI + Fastify API + PostgreSQL + Keycloak (login/register stay inside the app).

## Why Job Tracker

- **Never lose an application** — company, role, location, status, and history in one place
- **Works worldwide** — not tied to one country or job board
- **Privacy-first** — self-host; your data stays on your Postgres + Keycloak
- **In-app auth** — users never leave the product for login/register
- **Clean architecture** — separate frontend/backend, ready for contributors

## Features

- Keycloak-backed register / login / refresh (no Keycloak redirect UI)
- Dashboard overview with pipeline counts
- Applications CRUD with search and status filters
- Per-application timeline notes
- shadcn/ui dashboard shell with sidebar
- Docker Compose Postgres for local contributors
- CI: lint, typecheck, test, build

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js, TypeScript, Tailwind, shadcn/ui |
| Backend | Fastify, Zod, Drizzle ORM |
| Auth | Keycloak (in-app login/register via API) |
| Database | PostgreSQL |

## Monorepo layout

```text
frontend/            Next.js app
backend/             Fastify API
docker-compose.yml   optional local Postgres
.github/workflows/   CI
```

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 9+
- A Keycloak realm + confidential client (see below)
- A PostgreSQL database (hosted or `docker compose up -d`)

### Environment

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

Never commit `.env` or `frontend/.env.local`.

### Keycloak (in-app auth)

1. Create realm `jobtracker`
2. Create client `jobtracker-api`:
   - Client authentication: ON
   - Direct access grants: ON
   - Service accounts roles: ON
3. Assign service account roles from `realm-management`:
   - `manage-users`
   - `view-users`
4. Turn **User registration** OFF under Realm settings → Login
   (users register through the app, not Keycloak’s UI)

`KEYCLOAK_URL` is the host only, e.g. `https://auth.example.com`
(no `/admin` path).

### Database

Prefer a dedicated database name, e.g. `jobtracker`:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/jobtracker
```

Optional local Postgres:

```bash
docker compose up -d
```

Then:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

- Frontend: http://localhost:3000  
- Backend health: http://localhost:4000/v1/health  

`frontend/.env.local` should include:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## API overview

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/v1/auth/register` | Create Keycloak user (then sign in via login) |
| `POST` | `/v1/auth/login` | Email/password login |
| `POST` | `/v1/auth/refresh` | Refresh tokens |
| `GET` | `/v1/auth/me` | Current user (Bearer token) |

### Applications & notes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/v1/applications/summary` | Status counts for dashboard |
| `GET` | `/v1/applications` | List (search, status, cursor) |
| `POST` | `/v1/applications` | Create |
| `GET` | `/v1/applications/:id` | Detail |
| `PATCH` | `/v1/applications/:id` | Update |
| `DELETE` | `/v1/applications/:id` | Delete |
| `GET` | `/v1/applications/:id/notes` | Timeline notes |
| `POST` | `/v1/applications/:id/notes` | Add note |
| `DELETE` | `/v1/applications/:id/notes/:noteId` | Delete note |

UI routes: `/login`, `/register`, `/dashboard`, `/dashboard/applications`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run frontend and backend |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run backend tests |
| `pnpm build` | Build all packages |
| `pnpm db:migrate` | Apply Drizzle migrations |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).
