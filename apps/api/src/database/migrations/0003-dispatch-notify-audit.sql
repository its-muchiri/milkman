-- 0003 — dispatch, rider telemetry, notifications, audit, settings

-- ── DISPATCH ─────────────────────────────────────────────────────────
CREATE TABLE delivery_batches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date    date NOT NULL UNIQUE,               -- the delivery morning
  locked_at     timestamptz NOT NULL,               -- 22:00 Africa/Nairobi of prior day
  total_packs   integer NOT NULL DEFAULT 0 CHECK (total_packs >= 0),
  bicycle_packs integer NOT NULL DEFAULT 0 CHECK (bicycle_packs >= 0),
  moto_packs    integer NOT NULL DEFAULT 0 CHECK (moto_packs >= 0),
  generated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE delivery_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id     uuid NOT NULL REFERENCES delivery_batches(id),
  rider_id     uuid NOT NULL REFERENCES users(id),
  vehicle      vehicle_kind NOT NULL,
  max_packs    integer NOT NULL CHECK (max_packs > 0),   -- 35 or 100 from constants
  packs_total  integer NOT NULL DEFAULT 0 CHECK (packs_total >= 0),
  route_geojson jsonb,                                   -- stop order / route line (Phase 7)
  started_at   timestamptz,
  finished_at  timestamptz,
  CONSTRAINT run_within_cap CHECK (packs_total <= max_packs)
);
CREATE INDEX runs_batch_k ON delivery_runs (batch_id, rider_id);
CREATE INDEX runs_rider_k ON delivery_runs (rider_id);

CREATE TABLE deliveries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          uuid NOT NULL REFERENCES delivery_runs(id),
  order_id        uuid NOT NULL REFERENCES orders(id),
  sequence        integer NOT NULL CHECK (sequence > 0),
  status          delivery_status NOT NULL DEFAULT 'pending',
  proof_photo_url text,
  failed_reason   fail_reason,
  delivered_at    timestamptz,
  CONSTRAINT deliveries_one_per_order UNIQUE (order_id),
  CONSTRAINT deliveries_seq_unique    UNIQUE (run_id, sequence)
);
CREATE INDEX deliveries_run_k ON deliveries (run_id, sequence);

-- ── RIDER TELEMETRY (live map + route replay) ────────────────────────
CREATE TABLE rider_locations (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rider_id    uuid NOT NULL REFERENCES users(id),
  point       geometry(Point, 4326) NOT NULL,
  load_packs  integer NOT NULL DEFAULT 0 CHECK (load_packs >= 0),
  recorded_at timestamptz NOT NULL
);
CREATE INDEX rider_loc_point_gix    ON rider_locations USING gist (point);
CREATE INDEX rider_loc_rider_time_k ON rider_locations (rider_id, recorded_at DESC);

-- ── NOTIFICATIONS ────────────────────────────────────────────────────
CREATE TABLE notification_recipients (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel   notify_channel NOT NULL,
  address   text NOT NULL,                    -- email or WhatsApp number
  events    text[] NOT NULL DEFAULT '{}',     -- 'new_order','payment_received',...
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (channel, address)
);

CREATE TABLE notification_log (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event             text NOT NULL,
  channel           notify_channel NOT NULL,
  recipient         text NOT NULL,
  status            notify_status NOT NULL,
  provider_response jsonb,
  error             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notif_log_k ON notification_log (event, created_at DESC);

-- ── AUDIT ────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    uuid REFERENCES users(id),
  action      text NOT NULL,                  -- 'order.status_changed','order.amount_edited',...
  entity_type text NOT NULL,                  -- 'orders','payments','subscriptions',...
  entity_id   text NOT NULL,
  before      jsonb,
  after       jsonb,
  ip          inet,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_entity_k ON audit_log (entity_type, entity_id, created_at DESC);
CREATE INDEX audit_actor_k  ON audit_log (actor_id, created_at DESC);

-- ── SETTINGS (depot location, notification toggles, ...) ─────────────
CREATE TABLE settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER settings_touch_updated_at
  BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
