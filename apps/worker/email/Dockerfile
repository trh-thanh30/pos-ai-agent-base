FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pos/worker-email build
RUN pnpm --filter @pos/worker-email deploy --prod /prod/worker-email

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodejs
COPY --from=builder --chown=nodejs:nodejs /prod/worker-email ./
USER nodejs

CMD ["node", "dist/index.js"]
