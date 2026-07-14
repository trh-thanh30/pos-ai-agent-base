FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV PORT=3000
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter @pos/api db:generate
RUN pnpm --filter @pos/api build
RUN pnpm --filter @pos/api deploy --prod /prod/api

FROM base AS development
ENV NODE_ENV=development
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
CMD ["pnpm", "--filter", "@pos/api", "start:dev"]

FROM base AS runner
RUN apt-get update \
 && apt-get install -y --no-install-recommends dumb-init ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs --no-create-home --shell /usr/sbin/nologin nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /prod/api ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/docker-health-check.js ./docker-health-check.js
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/src/docs/templates ./src/docs/templates
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/src/email/templates ./src/email/templates

RUN mkdir -p /app/logs /app/uploads /app/temp /app/storage \
 && chown -R nodejs:nodejs /app/logs /app/uploads /app/temp /app/storage \
 && chmod -R 755 /app/logs /app/uploads /app/temp /app/storage

USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node docker-health-check.js || exit 1

CMD ["dumb-init", "node", "dist/main.js"]
