-- 0001 — extensions, enums, shared functions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ── Enums (mirror packages/shared/src/types.ts) ──────────────────────
CREATE TYPE user_role        AS ENUM ('admin','rider');
CREATE TYPE admin_permission AS ENUM ('depot','finance');
CREATE TYPE order_source     AS ENUM ('website','whatsapp','call','admin','subscription');
CREATE TYPE order_status     AS ENUM ('new','confirmed','packed','out_for_delivery','delivered','failed','cancelled');
CREATE TYPE payment_status   AS ENUM ('pending','paid','partially_paid','failed','refunded','expired');
CREATE TYPE zone_kind        AS ENUM ('bicycle','motorcycle','out_of_zone');
CREATE TYPE vehicle_kind     AS ENUM ('bicycle','motorcycle');
CREATE TYPE subscription_freq AS ENUM ('daily','alternate_days','custom_weekdays');
CREATE TYPE wallet_txn_type  AS ENUM ('top_up','purchase','refund','adjustment');
CREATE TYPE payment_method   AS ENUM ('mpesa_stk','mpesa_till','wallet','cash_on_delivery');
CREATE TYPE delivery_status  AS ENUM ('pending','delivered','failed');
CREATE TYPE fail_reason      AS ENUM ('door_locked','unreachable','other');
CREATE TYPE notify_channel   AS ENUM ('email','whatsapp');
CREATE TYPE notify_status    AS ENUM ('queued','sent','failed','skipped');

-- ── Shared trigger function: keep updated_at fresh ───────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
