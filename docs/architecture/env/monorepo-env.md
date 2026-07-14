# Monorepo Environment

This monorepo now keeps runtime environment validation inside each runtime app instead of the removed shared environment package.

## Current Runtime Apps

- `apps/api`: NestJS API. Reads `.env.<NODE_ENV>` through `@nestjs/config` and validates with Zod in `apps/api/src/config/env.validation.ts`.
- `apps/web/main`: Next.js main web app. Uses `NEXT_PUBLIC_*` for client-visible values.
- `apps/web/retail`: Next.js retail web app. Uses `NEXT_PUBLIC_*` for client-visible values.
- `apps/worker/email`: email worker.
- `apps/worker/telegram`: telegram worker.

## Database

The canonical database is PostgreSQL through Prisma.

```env
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=app
DB_SCHEMA=public
```

`apps/api/src/config/env.validation.ts` can construct `DATABASE_URL` from the component variables when the full URL is not provided.

## Local Infrastructure

Use the current Docker compose file:

```bash
pnpm run infra:dev:up
```

MongoDB-specific variables and Docker services were removed with the legacy Express API and MongoDB Prisma package. If a future module needs MongoDB again, add it as a new adapter with its own documented interface instead of reviving the old shared config package.

## Rules

- Server secrets stay in server/worker env files only.
- Browser-visible values must use `NEXT_PUBLIC_*`.
- Prefer `DATABASE_URL` as the single database interface for `apps/api`.
- Keep environment validation close to the runtime app that owns the variables.
