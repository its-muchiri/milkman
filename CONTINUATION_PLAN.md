# The Milkman — Continuation Plan (paused mid–Phase 1 verification)

Resume by following "Exact restart steps" at the bottom. Do not re-write code
that is already listed as DONE.

## Where we are

- Spec: `PROJECT_SPEC.md` exists and includes the owner clarification —
  **order intake 08:00–22:00 daily, cut-off 22:00, delivery 05:30–08:00, Africa/Nairobi**.
- Phase 1 (Foundation) was **approved** (folder structure + full schema) and the
  code is fully written. What was NOT finished: dependency install, build,
  unit-test run, migration run, seed run, and API smoke test.
- At pause time, `npm install` (terminal in background) and
  `docker compose up -d` (pulling `postgis/postgis:16-3.4`, ~212 MB) were still
  running. Both may have completed since; verify before re-running.

## DONE (written to disk, unverified unless noted)

### Root
- `package.json` (npm workspaces: apps/api, apps/web, packages/shared)
- `docker-compose.yml` — postgis/postgis:16-3.4 + redis:7-alpine, healthchecks, named volumes
- `tsconfig.base.json`, `.gitignore`, `.env.example`, `.env` (copy of example, dev values)
- `README.md` (run instructions + smoke checks + assumptions)
- `PROJECT_SPEC.md`

### packages/shared (`@milkman/shared`)
- `constants.ts` — PACK_PRICE_KSH=50, bicycle ≤2.5 km/35 packs, motorcycle ≤10 km/100 packs,
  intake 08:00→cutoff 22:00, delivery window 05:30–08:00, TIMEZONE Africa/Nairobi,
  low-wallet alert KSh 100, OUT_OF_ZONE_MESSAGE
- `types.ts` — all enum mirrors + GeoPoint
- `pricing.ts` — packsTotalKsh, addonsTotalKsh, orderTotalKsh, formatKsh, PricingError
- `zone.ts` — zoneForDistance, vehicleForZone, maxPacksForVehicle, selectVehicle, assertWithinRunCap
- `geofence.ts` — haversineKm, checkGeofence
- `phone.ts` — normalizeKePhone (07xx/01xx/+254/254… → E.164), isValidKePhone
- `time.ts` — toNairobiParts, isOrderIntakeOpen, orderIntakeState, deliveryDateFor,
  isWithinDeliveryWindow, isPastDeliveryDeadline, hhmmToMinutes
- Unit tests: `src/__tests__/pricing|zone|geofence|phone|time.test.ts` (vitest) — WRITTEN, NEVER RUN

### apps/api (NestJS + TypeORM + pg)
- `src/database/data-source.ts` — env loading (dotenv, repo-root .env), buildDataSourceOptions
- `src/database/database.module.ts` — TypeOrmModule.forRootAsync
- Raw SQL migrations (approved schema, all 22+ tables incl. audit_log, settings, leads,
  payments, delivery_* , rider_locations; GiST spatial indexes on addresses.point,
  orders.delivery_point, rider_locations.point; order_reference_seq START 1000 → MLK-####;
  append-only trigger on wallet_transactions; set_updated_at triggers):
  - `0001-extensions-and-enums.sql`, `0002-core-tables.sql`, `0003-dispatch-notify-audit.sql`
- `src/database/scripts/migrate.ts` — runner tracking applied files in schema_migrations
- `src/database/scripts/seed.ts` — idempotent; creates 1 admin (perms depot+finance),
  2 riders, milk pack product, Yoghurt/Mala add-ons (KSh 100), depot in `settings`,
  4 customers with zoned addresses (2 bicycle, 2 motorcycle), wallets with ledger
  txns (Kevin at KSh 50 → below alert line), 2 subscriptions (daily; custom_weekdays 1,3,5),
  3 orders with items + status history + audit entries
- Entities: `entities/user.entity.ts`, `customer.entity.ts` (Customer/Address/Lead),
  `catalog.entity.ts`, `order.entity.ts` (Subscription/Order/OrderItem/OrderStatusHistory),
  `money.entity.ts` (Wallet/WalletTransaction/Payment/AuditLogEntry/Setting)
- Auth: `auth.decorators.ts` (@Public/@Roles/@RequirePermission/@CurrentUser, AuthUser),
  `auth.guards.ts` (global JwtAuthGuard + RolesGuard registered in app.module),
  `auth.service.ts` (bcrypt compare; email-or-phone login with phone normalization),
  `auth.controller.ts` (POST /api/auth/login public, GET /api/auth/me), `auth.module.ts`
- Users: `users.*` — GET /api/users admin-only; GET /api/users/:id admin-or-self (rider isolation)
- Audit: `audit/audit.service.ts` + module (never fails business op; logs loudly on failure)
- Health: GET /api/health (public; pings Postgres + postgis_version())
- `app.module.ts` (global guards via APP_GUARD), `main.ts` (prefix /api, ValidationPipe
  whitelist, CORS from WEB_ORIGIN, port API_PORT=3001)

### apps/web
- Scaffold only (per "no UI yet"): package.json (Next 14 + React 18 + Tailwind 3),
  tsconfig, next.config.mjs, tailwind.config.ts, postcss.config.js,
  `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` placeholder importing
  PACK_PRICE_KSH + TIMEZONE from shared

## NOT DONE / UNVERIFIED (the remaining Phase 1 tail)

1. `npm install` — was still running; confirm `node_modules` exists, no errors.
2. Docker images — confirm `docker compose ps` shows db + redis healthy
   (pull of postgis image was at ~63/212 MB).
3. `npm run build:shared` then `npm run test:shared` — expect ~30 tests green.
   Known risk: `formatKsh` test expects `KSh 1,250` via `toLocaleString('en-KE')`;
   ICU output may differ on Node 25 — adjust test to accept the locale separator if so.
4. `npm run migrate` — expect 3 files applied. Known risks:
   - `CREATE EXTENSION citext/pgcrypto` requires the extension be available in the
     postgis image (they are, in postgis/postgis:16-3.4).
   - users entity declares `email` as type `'citext'` — fine for reads/writes.
5. `npm run seed` — known risks:
   - TypeORM geometry writes pass GeoJSON `{type:'Point',coordinates:[lng,lat]}` cast
     `as never`; if TypeORM rejects, insert addresses/orders via raw
     `ST_SetSRID(ST_MakePoint($lng,$lat),4326)` queries instead.
   - `reference: undefined as never` relies on TypeORM omitting undefined columns so the
     DB default (`'MLK-' || nextval(...)`) applies; if TypeORM forces NULL, remove the
     property from create() entirely.
   - orders insert sets `placedAt` explicitly (entity default + column default should not conflict).
6. `npm run dev:api` + smoke test:
   - GET /api/health → ok
   - POST /api/auth/login (admin email + SEED_ADMIN_PASSWORD) → token
   - GET /api/users with admin token → list; with rider token → 403
   - GET /api/users/:id as rider with someone else's id → 403
   - Rider login accepts 0700111001 or +254700111001
7. Optional: `npm run dev -w web` → placeholder page renders.
8. Phase-1 closing report to owner: what's done / untested / assumed.

## Assumptions made (owner has not explicitly confirmed these)

- Depot = Nairobi CBD default (-1.286389, 36.817244) until real coordinates provided.
- Boundary rules: exactly 2.5 km → bicycle; exactly 10 km → inside fence (motorcycle).
- Post-cut-off (22:00–08:00) orders are rejected by intake rules; `deliveryDateFor`
  defensively assigns +2 days if called with such a timestamp anyway.
- Amounts are whole-KSh integers; `balance_after_ksh` is a cache on the ledger
  (true balance = SUM(delta_ksh)).
- Migrations are raw SQL run by a custom runner (approved plan mentioned TypeORM;
  entities ARE TypeORM — migrations intentionally stay raw SQL for PostGIS fidelity).
- `orders.subscription_id` seeded on two orders for realism, though subscription
  generation itself is Phase 9; spec's DATA MODEL does not list it on orders but
  links subscriptions → orders via nightly demand.
- Wallet ledger keeps both `idempotency_key` and partial-unique `mpesa_receipt`
  to guarantee "one credit per receipt" (Phase 6 will rely on these).

## Exact restart steps (PowerShell, from repo root)

```powershell
docker compose ps                      # if not healthy: docker compose up -d, wait
Test-Path node_modules\typeorm         # if missing: npm install
npm run build:shared
npm run test:shared                    # fix any assertion drift
npm run migrate
npm run seed
npm run dev:api                        # then run the smoke tests above
```

Then report done/untested/assumed to the owner and wait for the Phase 2 prompt
(design system). Phase gates: do NOT start Phase 2+ without the owner's one-line phase prompt.
