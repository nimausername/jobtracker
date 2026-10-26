# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile --filter @jobtracker/frontend...

FROM base AS build
COPY --from=deps /app/ ./
COPY frontend ./frontend
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm --filter @jobtracker/frontend build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=build --chown=nodejs:nodejs /app/frontend/public ./frontend/public
COPY --from=build --chown=nodejs:nodejs /app/frontend/.next/standalone ./
COPY --from=build --chown=nodejs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nodejs
EXPOSE 3000

CMD ["node", "frontend/server.js"]
