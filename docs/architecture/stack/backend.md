# Backend Stack

The active backend is `@pos/api` in `apps/api`.

## Runtime

- Framework: NestJS 11
- HTTP adapter: `@nestjs/platform-express`
- Database: PostgreSQL
- ORM: Prisma 7 with `@prisma/adapter-pg`
- Validation: Zod for environment variables, `class-validator`/Nest validation pipe for request DTOs
- Auth: Nest guards, JWT, OAuth where configured
- Docs/static assets: served by the Nest app

`@nestjs/platform-express` is still part of the Nest runtime. There is no standalone Express app in the active workspace.

## Database

Prisma is configured in:

- `apps/api/prisma/schema.prisma`
- `apps/api/src/prisma/prisma.service.ts`
- `apps/api/src/config/database.config.ts`

MongoDB and Mongoose are not part of the active backend stack.

## Local Commands

```bash
pnpm run dev:backend
pnpm --filter @pos/api run type-check
pnpm --filter @pos/api run test
pnpm --filter @pos/api run db:generate
pnpm --filter @pos/api run db:push:dev
```

## Module Rules

- Feature behavior lives in Nest modules under `apps/api/src/module`.
- Cross-cutting behavior lives under `apps/api/src/common`, `apps/api/src/config`, `apps/api/src/prisma`, or `apps/api/src/shared`.
- Keep direct `Request`/`Response` usage to endpoints that must stream/download files or manipulate cookies.
- Prefer framework return values for ordinary JSON endpoints so response shaping stays behind interceptors.
