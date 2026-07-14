# DevOps Stack

The current local infrastructure is intentionally small:

- PostgreSQL for `apps/api`
- Redis for optional cache/queue workloads
- MinIO for S3-compatible object storage

## Local Docker

```bash
pnpm run infra:dev:up
pnpm run infra:dev:logs
pnpm run infra:dev:down
```

## Environment

Use PostgreSQL variables:

```env
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}
DB_HOST=localhost
DB_PORT=15433
DB_USER=pos_user
DB_PASSWORD=pos_password
DB_NAME=pos_db
DB_SCHEMA=public
```

Redis remains optional:

```env
REDIS_URL=redis://:pos_redis_password@localhost:6319
```

## Removed Legacy Infrastructure

The old nested Docker compose and MongoDB scripts were removed because the active stack is PostgreSQL, Redis, MinIO, NestJS, and Next.js. If MongoDB is introduced again, add a new compose profile and document the owning module explicitly.
