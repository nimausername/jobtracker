# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS build
# Coolify injects NODE_ENV=production via build-arg; that skips devDependencies (typescript).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile --filter @jobtracker/backend... --config.production=false

COPY backend ./backend
RUN pnpm install --frozen-lockfile --filter @jobtracker/backend... --config.production=false \
  && pnpm --filter @jobtracker/backend build \
  && pnpm --filter @jobtracker/backend deploy --prod /deploy

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=build --chown=nodejs:nodejs /deploy/ ./
COPY --from=build --chown=nodejs:nodejs /app/backend/drizzle ./drizzle

USER nodejs
EXPOSE 4000

CMD ["sh", "-c", "node dist/db/migrate.js && exec node dist/index.js"]
