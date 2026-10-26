# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
# Inline NODE_ENV: Coolify passes --build-arg NODE_ENV=production, which would
# skip devDependencies (typescript) and break `tsc`.
RUN NODE_ENV=development pnpm install --frozen-lockfile --filter @jobtracker/backend...

FROM base AS build
COPY --from=deps /app/ ./
COPY backend ./backend
RUN NODE_ENV=development pnpm --filter @jobtracker/backend build \
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
