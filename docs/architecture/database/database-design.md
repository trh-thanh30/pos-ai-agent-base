# Database Design

The current persistence model uses PostgreSQL through Prisma in `apps/api`.

## Source Of Truth

- Prisma schema: `apps/api/prisma/schema.prisma`
- Runtime Prisma service: `apps/api/src/prisma/prisma.service.ts`
- Migrations: `apps/api/prisma/migrations`

## Provider

```prisma
datasource db {
  provider = "postgresql"
}
```

The legacy document-store schema has been removed from the active workspace. Historical design material should be recovered from git history only if a migration/reference is needed.

## Local Development

```bash
pnpm run infra:dev:up
pnpm --filter @pos/api run db:push:dev
pnpm --filter @pos/api run db:seed:dev
```

Use `.env.development` or `.env.example` as the environment template.

## Design Notes

- Use Prisma models and generated types as the database interface for `apps/api`.
- Keep database-specific code inside the `PrismaModule` and feature modules that own their queries.
- Avoid adding a shared database package until more than one runtime app needs the same database interface.
