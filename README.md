# The Milkman

Fresh milk delivery in Kenya. Every pack KSh 50. Orders 08:00–22:00, delivered
next morning 05:30–08:00, Africa/Nairobi. See `PROJECT_SPEC.md` for the full
product spec; this repo currently contains **Phase 1 (foundation)** only.

## Repo layout

```
apps/
  api/        NestJS + TypeORM API (PostgreSQL/PostGIS). Auth (admin/rider), audit, health.
  web/        Next.js + TypeScript + Tailwind. Holds the public site, admin panel and
              rider PWA in later phases. Phase 1: scaffold + placeholder only.
packages/
  shared/     Pure TypeScript: constants, types, pricing/zone/geofence/phone/time helpers
              with unit tests (vitest). No framework dependencies.
docker-compose.yml   PostgreSQL 16 + PostGIS 3.4, Redis 7.
```

## Prerequisites

- Node.js 20+ and npm 10+
- Docker Desktop (for PostgreSQL/PostGIS + Redis)

## Run it

```powershell
# 1. Start the databases
docker compose up -d

# 2. Install all workspaces
npm install

# 3. Configure environment
copy .env.example .env      # then edit JWT_SECRET + seed passwords

# 4. Build the shared package first (API and web import its compiled output)
npm run build:shared

# 5. Apply the schema migrations (raw SQL, tracked in schema_migrations)
npm run migrate

# 6. Seed: 1 admin, 2 riders, products, add-ons, 4 customers, wallets,
#    subscriptions and sample orders
npm run seed

# 7. Start the API (http://localhost:3001/api)
npm run dev:api

# 8. (Optional) Start the web placeholder (http://localhost:3000)
npm run dev -w web

# 9. Run the shared business-logic unit tests
npm run test:shared
```

## Smoke-check the auth guards

```powershell
# Health (public)
curl http://localhost:3001/api/health

# Login as admin (email + SEED_ADMIN_PASSWORD from .env)
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"identifier\":\"admin@milkman.co.ke\",\"password\":\"ChangeMe_Admin_254\"}'
# → { accessToken, user } — use: -H "Authorization: Bearer <token>"

# Role enforcement: GET /api/users with the rider token returns 403;
# with the admin token it lists users. GET /api/auth/me returns the caller.
```

## Business rules encoded in `packages/shared`

| Rule | Value |
|---|---|
| Pack price | KSh 50 (500 ml, ~0.5 kg) |
| Bicycle zone | 0–2.5 km from depot, max 35 packs/run |
| Motorcycle zone | 2.5–10 km, max 100 packs/run |
| Geofence | pins > 10 km rejected ("We don't reach you yet") |
| Order intake | 08:00–22:00 daily, cut-off locks next-morning delivery |
| Delivery window | 05:30–08:00 |
| Time zone | Africa/Nairobi (UTC+3, no DST) |
| Wallet | append-only ledger (`wallet_transactions`), trigger blocks UPDATE/DELETE |
| Order reference | `MLK-` + DB sequence starting at 1000 |

## What is intentionally NOT built yet (later phases)

- All UI (Phase 2–3, 5, 8), payments/Daraja (Phase 6), notifications/BullMQ
  (Phase 4), maps/WebSockets (Phase 5), nightly batch & dispatch (Phase 7),
  subscriptions runtime (Phase 9). Tables for these exist in the schema; the
  Redis container is already running for Phase 4.

## Notes & assumptions

- Depot location comes from `DEPOT_LAT`/`DEPOT_LNG` (seeded into `settings`);
  default is Nairobi CBD — replace with your real depot.
- Migrations are plain SQL files under `apps/api/src/database/migrations/`,
  applied in sort order by `npm run migrate`; each file runs in one transaction.
- Amounts are whole KSh integers (no cents in this business).
- Passwords are bcrypt-hashed (`bcryptjs`). Riders log in with phone, admins
  with email — both against `/api/auth/login`.
- Seed is idempotent: it skips if the admin user already exists.
