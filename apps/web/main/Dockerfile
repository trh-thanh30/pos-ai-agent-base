FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pos/web-main build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/web/main/.next/standalone ./
COPY --from=builder /app/apps/web/main/.next/static ./apps/web/main/.next/static
COPY --from=builder /app/apps/web/main/public ./apps/web/main/public

EXPOSE 3000
CMD ["node", "apps/web/main/server.js"]
