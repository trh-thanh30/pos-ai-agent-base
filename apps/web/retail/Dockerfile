FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pos/web-retail build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/web/retail/.next/standalone ./
COPY --from=builder /app/apps/web/retail/.next/static ./apps/web/retail/.next/static
COPY --from=builder /app/apps/web/retail/public ./apps/web/retail/public

EXPOSE 3002
CMD ["node", "apps/web/retail/server.js"]
