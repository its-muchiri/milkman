-- 0002 — people, catalog, subscriptions, orders, wallet, payments

-- ── PEOPLE ───────────────────────────────────────────────────────────
CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role           user_role NOT NULL,
  name           text NOT NULL,
  email          citext UNIQUE,                          -- required for admin
  phone          text UNIQUE,                            -- required for rider (login id)
  password_hash  text NOT NULL,                          -- bcrypt/argon hash
  is_active      boolean NOT NULL DEFAULT true,
  admin_perms    admin_permission[] NOT NULL DEFAULT '{}', -- depot / finance sub-perms
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_admin_email  CHECK (role <> 'admin' OR email IS NOT NULL),
  CONSTRAINT users_rider_phone  CHECK (role <> 'rider'  OR phone  IS NOT NULL)
);
CREATE INDEX users_role_k ON users (role) WHERE is_active;

CREATE TABLE customers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  phone             text NOT NULL UNIQUE,               -- normalized +254 E.164
  created_by        uuid REFERENCES users(id),
  consent_marketing boolean NOT NULL DEFAULT false,     -- KDPA consent
  consent_at        timestamptz,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER customers_touch_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text,
  phone       text,
  source      order_source NOT NULL DEFAULT 'website',
  payload     jsonb,                                    -- raw form data incl. location hint
  converted_to_customer_id uuid REFERENCES customers(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_phone_k ON leads (phone, created_at DESC);

CREATE TABLE addresses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid REFERENCES customers(id) ON DELETE SET NULL,
  label        text,                                     -- "Home", "Gate 2"...
  landmark     text,                                     -- typed fallback when no pin
  notes        text,                                     -- gate code, leave with guard
  point        geometry(Point, 4326) NOT NULL,
  distance_m   integer NOT NULL CHECK (distance_m >= 0), -- cached metres from depot
  zone         zone_kind NOT NULL,                       -- derived in code from distance
  vehicle      vehicle_kind,                             -- null when out_of_zone
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX addresses_point_gix   ON addresses USING gist (point);
CREATE INDEX addresses_customer_k  ON addresses (customer_id);

-- ── CATALOG ──────────────────────────────────────────────────────────
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  pack_size_ml  integer NOT NULL DEFAULT 500,
  is_pack_based boolean NOT NULL DEFAULT true,           -- priced PACK_PRICE per unit
  is_active     boolean NOT NULL DEFAULT true
);

CREATE TABLE addons (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name      text NOT NULL,
  price_ksh integer NOT NULL CHECK (price_ksh > 0),      -- fixed increments (e.g. 100)
  is_active boolean NOT NULL DEFAULT true
);

-- ── SUBSCRIPTIONS ────────────────────────────────────────────────────
CREATE TABLE subscriptions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id        uuid NOT NULL REFERENCES customers(id),
  address_id         uuid NOT NULL REFERENCES addresses(id),
  packs_per_delivery integer NOT NULL CHECK (packs_per_delivery > 0),
  frequency          subscription_freq NOT NULL,
  weekdays           smallint[] NOT NULL DEFAULT '{}',   -- 0=Sun..6=Sat, custom_weekdays only
  paused             boolean NOT NULL DEFAULT false,     -- pause toggle skips deliveries
  starts_on          date NOT NULL,
  ends_on            date,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subs_weekdays_only_for_custom CHECK (
    (frequency = 'custom_weekdays' AND cardinality(weekdays) > 0)
    OR frequency <> 'custom_weekdays'),
  CONSTRAINT subs_end_after_start CHECK (ends_on IS NULL OR ends_on >= starts_on)
);
CREATE INDEX subs_customer_k ON subscriptions (customer_id) WHERE NOT paused;

-- ── ORDERS ───────────────────────────────────────────────────────────
CREATE SEQUENCE order_reference_seq START 1000;          -- MLK-1042 style

CREATE TABLE orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference        text NOT NULL UNIQUE DEFAULT 'MLK-' || nextval('order_reference_seq'),
  customer_id      uuid NOT NULL REFERENCES customers(id),
  address_id       uuid REFERENCES addresses(id),
  subscription_id  uuid REFERENCES subscriptions(id),
  source           order_source NOT NULL DEFAULT 'website',
  status           order_status NOT NULL DEFAULT 'new',
  payment_status   payment_status NOT NULL DEFAULT 'pending',
  packs            integer NOT NULL CHECK (packs > 0),
  total_ksh        integer NOT NULL CHECK (total_ksh >= 0),   -- packs x 50 + add-ons (recomputed in code)
  delivery_point   geometry(Point, 4326) NOT NULL,
  zone             zone_kind NOT NULL,                   -- frozen at order time
  vehicle          vehicle_kind,
  delivery_date    date NOT NULL,                        -- the morning it is due
  note             text,
  cancelled_reason text,
  failed_reason    fail_reason,
  placed_at        timestamptz NOT NULL DEFAULT now(),
  locked_at        timestamptz,                          -- batch lock (22:00 prior night)
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_point_gix   ON orders USING gist (delivery_point);
CREATE INDEX orders_status_k    ON orders (status, delivery_date);
CREATE INDEX orders_customer_k  ON orders (customer_id, placed_at DESC);
CREATE INDEX orders_date_k      ON orders (delivery_date);
CREATE INDEX orders_subscription_k ON orders (subscription_id, delivery_date) WHERE subscription_id IS NOT NULL;
CREATE INDEX orders_payment_k   ON orders (payment_status)
  WHERE payment_status IN ('pending','partially_paid','failed');
CREATE TRIGGER orders_touch_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id         uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       uuid REFERENCES products(id),
  addon_id         uuid REFERENCES addons(id),
  qty              integer NOT NULL CHECK (qty > 0),
  unit_price_ksh   integer NOT NULL CHECK (unit_price_ksh >= 0),  -- snapshot at order time
  line_total_ksh   integer GENERATED ALWAYS AS (qty * unit_price_ksh) STORED,
  CONSTRAINT item_has_exactly_one_source CHECK (
    (product_id IS NOT NULL)::int + (addon_id IS NOT NULL)::int = 1)
);
CREATE INDEX order_items_order_k ON order_items (order_id);

CREATE TABLE order_status_history (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  changed_by  uuid REFERENCES users(id),                 -- null = system
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX osh_order_k ON order_status_history (order_id, created_at);

-- ── WALLET (append-only ledger; balance = SUM(delta_ksh)) ────────────
CREATE TABLE wallets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wallet_transactions (
  id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallet_id          uuid NOT NULL REFERENCES wallets(id),
  txn_type           wallet_txn_type NOT NULL,
  delta_ksh          integer NOT NULL CHECK (delta_ksh <> 0),  -- +credit / −debit
  mpesa_receipt      text,
  order_id           uuid REFERENCES orders(id),
  balance_after_ksh  integer NOT NULL,        -- cache; source of truth is SUM(delta_ksh)
  idempotency_key    text UNIQUE,             -- duplicate callbacks can never double-credit
  created_by         uuid REFERENCES users(id),
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX wtx_wallet_k ON wallet_transactions (wallet_id, id);
CREATE UNIQUE INDEX wtx_receipt_u ON wallet_transactions (mpesa_receipt) WHERE mpesa_receipt IS NOT NULL;

CREATE OR REPLACE FUNCTION reject_wallet_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'wallet_transactions is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wtx_append_only
  BEFORE UPDATE OR DELETE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION reject_wallet_mutation();

-- ── PAYMENTS ─────────────────────────────────────────────────────────
CREATE TABLE payments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           uuid REFERENCES orders(id),
  wallet_topup       boolean NOT NULL DEFAULT false,
  method             payment_method NOT NULL,
  status             payment_status NOT NULL DEFAULT 'pending',
  amount_ksh         integer NOT NULL CHECK (amount_ksh > 0),
  amount_paid_ksh    integer NOT NULL DEFAULT 0 CHECK (amount_paid_ksh >= 0),
  phone              text NOT NULL,
  mpesa_receipt      text UNIQUE,                       -- null until callback confirms
  checkout_request_id text UNIQUE,                       -- STK idempotency anchor
  callback_payload   jsonb,
  reconciled         boolean NOT NULL DEFAULT false,
  requested_at       timestamptz NOT NULL DEFAULT now(),
  paid_at            timestamptz,
  CONSTRAINT payment_links_something CHECK (order_id IS NOT NULL OR wallet_topup),
  CONSTRAINT paid_lte_amount CHECK (amount_paid_ksh <= amount_ksh)
);
CREATE INDEX payments_status_k   ON payments (status, requested_at DESC);
CREATE INDEX payments_order_k    ON payments (order_id);
CREATE INDEX payments_unmatched_k ON payments (requested_at DESC)
  WHERE NOT reconciled AND status = 'paid';
