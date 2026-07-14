# POS System Monorepo

Monorepo cho hệ thống POS. Backend API chính hiện là NestJS tại `apps/api`.

## Cấu trúc chính

```txt
apps/
  api/                      # NestJS + Prisma/Postgres API
  web/
    main/                   # Next.js main web app
    retail/                 # Next.js retail web app
  worker/
    email/                  # Email worker
    telegram/               # Telegram worker
  docs/                     # Documentation app
packages/
  design-system/
  dto/
  email/
  logger/
  secure-endpoints/
  telegram/
  types/
  utils/
```

## Scripts

```bash
pnpm run dev                 # web-main + Nest backend
pnpm run dev:frontend        # tất cả frontend apps
pnpm run dev:frontend:main   # web-main
pnpm run dev:frontend:retail # web-retail
pnpm run dev:backend         # Nest backend @pos/api
pnpm run dev:workers         # workers
pnpm run build:backend       # build Nest backend
pnpm run build:apps
pnpm run build:packages
pnpm run lint
pnpm run type-check
pnpm run test
```

## Local setup

```bash
pnpm install
cp .env.example .env.development
pnpm run infra:dev:up
pnpm run dev
```

## Backend

- Package: `@pos/api`
- Path: `apps/api`
- Framework: NestJS
- Database: Postgres qua Prisma
- Default local port: `4100`
- Default API URL: `http://localhost:4100/api/v1`

## Notes

Legacy `apps/server/api` đã được gỡ khỏi monorepo. Nếu cần logic cũ, lấy lại từ lịch sử git/backup và migrate từng phần sang `apps/api`.
