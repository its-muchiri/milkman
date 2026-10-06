# PROJECT: The Milkman

A fresh milk delivery platform in Kenya.

## CORE IDEA
Every product is a standardized KSh 50 pack (about 500 ml, ~0.5 kg).
Price = packs x 50 (plus fixed-price add-ons). Orders lock at 10:00 PM for
next-morning delivery between 5:30 AM and 8:00 AM. All times use Africa/Nairobi (UTC+3).

> UPDATE (No. 04 + owner clarification): Milk orders are accepted **daily between 08:00 and
> 22:00 Africa/Nairobi**. Anything placed by the 22:00 cut-off locks for next-morning
> delivery between 05:30 and 08:00. Outside 08:00–22:00 the order form is closed.

## USERS (only two logged-in roles)
- admin: runs the whole business (can have sub-permissions: depot, finance).
- rider: sees only their own assigned runs and deliveries.
Customers are NOT users. They are database records managed by the admin.

## FOUR SURFACES, ONE BACKEND
1. Public website (no login): editorial, animated, with a simple "Order milk here" form.
2. Admin panel (login): map-first dashboard, orders, payments, customers, dispatch, settings.
3. Rider app (login, mobile PWA): load, route loops, delivery actions, proof photo, GPS.
4. API: NestJS + PostgreSQL/PostGIS behind all of them.

## BUSINESS RULES (must be enforced in code)
- Unit price KSh 50 per pack. Add-ons in fixed increments (e.g. KSh 100 yoghurt).
- Bicycle: 0 to 2.5 km from depot, max 35 packs per run.
- Motorcycle: 2.5 to 10 km from depot, max 100 packs per run.
- Geofence: pins beyond 10 km are rejected with a friendly message; the zone decides the vehicle.
- Nightly demand = sum of subscription packs + sum of one-time packs.
- Subscriptions: daily, alternate days, or custom weekdays; pause toggle skips deliveries.
- Wallet: append-only ledger (never store only a balance); alert when balance < KSh 100.
- Payments: M-Pesa STK Push via Daraja. Callbacks MUST be idempotent (one credit per receipt).
- Order status: New > Confirmed > Packed > Out for delivery > Delivered,
  with side exits Failed (door locked/unreachable) and Cancelled.
- Every status change and every admin edit to money or orders is written to audit_log.

## ORDER FORM (public, one screen, no login)
Title: "Order milk here". Fields: name, Kenyan phone (07xx/01xx/+254, normalized),
pack stepper with live total ("3 packs = KSh 150"), delivery location
("Use my location", tap-to-pin mini map, or typed landmark; instant geofence check),
optional note. One button: "Order milk".
On submit: create order with reference like MLK-1042, show confirmation with a
"Chat on WhatsApp" button and an optional "Pay with M-Pesa" STK Push.
Spam protection: honeypot field, rate limiting, Cloudflare Turnstile.
No heavy animation on the form; it must work well on slow phones.

## ADMIN DASHBOARD
- Home screen is a full-screen live orders map (Mapbox GL): status-colored pins,
  payment badge per pin, clustering, zone rings (2.5 km bicycle, 10 km motorcycle),
  live rider positions with load, route lines per rider, heatmap toggle,
  filters (date, status, payment, rider, vehicle, zone), draw-to-select to bulk-assign
  riders, and a click-through order drawer with quick actions
  (Confirm, Assign rider, Send STK Push, Call, WhatsApp, Cancel).
  Real-time updates through WebSockets (NestJS gateway).
- Orders table (search, filter, export) and a per-order timeline with proof photo.
- Late/stuck alerts (e.g. not delivered by 8:00 AM).
- Payments section: statuses (Pending, Paid, Failed, Refunded, Partially paid),
  receipt number, phone, amount, linked order or top-up, unmatched-payments review
  queue, daily reconciliation, one-click STK retry, summary cards.
- Notification settings (recipients and events) and a notification log.

## ALERTS (admin email AND WhatsApp)
Events: new order, payment received, payment failed/expired, delivery failed, order late,
daily summary (9 AM), nightly batch ready (10 PM).
Send through a BullMQ + Redis queue with retries. If WhatsApp fails, email still goes out
and the failure is logged. WhatsApp uses the Business Cloud API with pre-approved
templates. Keep message content minimal; use a Google Maps link instead of a full address.

## DESIGN DIRECTION
Editorial, milk-themed, magazine meets dairy.
- Palette: milk white #FAF7F0 base, ink #1A1A1A text, cream #F1EAD9 panels,
  one accent carton blue #2B4BFF used sparingly. Subtle paper-grain texture.
- Type: high-contrast serif for headlines (Fraunces / Instrument Serif), clean grotesk
  for body (Inter / Satoshi), mono for labels and numbers. Oversized headlines and
  giant "KSh 50" numerals as graphic elements. Issue-style headers ("No. 01"), thin
  rules, pull quotes, asymmetric grids.
- Motifs: liquid blobs, pour/drip shapes, ripples, wave dividers, the pack as hero object.
- Voice: warm and short ("Fresh by 6 AM. Fifty shillings. That's the whole idea.")

## PUBLIC SITE MOTION
Lenis smooth scroll, GSAP ScrollTrigger (pinned sections, parallax, scrubbed timelines),
Framer Motion for UI transitions, split-text headline reveals, hero milk-pour animation,
milk-fill scroll progress glass, morphing blob shapes, horizontal scroll "route" section,
marquee ticker, clip-path reveals, magnetic buttons and milk-drop cursor (desktop only),
milk-wipe page transitions, short milk-fill preloader, animated counters.
Optional lazy-loaded 3D milk pack (React Three Fiber) that never blocks content.
Rider app: minimal, high contrast, glove-friendly large buttons, almost no motion.
Admin: editorial type and colors, data-dense, subtle transitions only.

## PERFORMANCE AND ACCESSIBILITY
Mobile Lighthouse 85+, first load around 1.5 MB or less, respect prefers-reduced-motion,
lazy-load heavy assets, WebP/AVIF images, self-hosted subset fonts with font-display swap,
reduce effects on low-end devices and slow networks, WCAG AA contrast.

## TECH STACK
Next.js (TypeScript) + Tailwind for public site, admin, and rider PWA.
NestJS + PostgreSQL/PostGIS, Redis + BullMQ, Daraja API, Mapbox GL JS,
WhatsApp Business Cloud API, Resend or Amazon SES, Cloudflare Turnstile.
Docker for local dev. Rider PWA must have an offline queue that syncs later.

## DATA MODEL
users (admin, rider), customers, leads, addresses (PostGIS point, notes, zone, vehicle),
products, addons, orders (source, status, payment_status, delivery_point, reference),
order_items, order_status_history, subscriptions, wallets, wallet_transactions (ledger),
payments (receipt_number, callback_payload, reconciled), delivery_batches, delivery_runs,
deliveries (status, photo, timestamp), rider_locations, notification_recipients,
notification_log, audit_log.

## SECURITY AND COMPLIANCE
Role-based access on every endpoint, riders limited to their own data, validated inputs,
secrets only in environment variables, Kenya Data Protection Act awareness
(consent, retention), HTTPS only.

## PHASED BUILD ORDER (do one phase at a time; approval before code each phase)
1. Foundation: monorepo (apps/web, apps/api, packages/shared), Docker (Postgres+PostGIS,
   Redis), full schema + migrations with indexes (incl. PostGIS spatial index), shared
   constants (PACK_PRICE=50, caps/distances, order intake 08:00–22:00, cut-off 22:00,
   delivery window 05:30-08:00, Africa/Nairobi), pure unit-tested helpers (pricing, vehicle selection, geofence),
   role-based auth (admin/rider) with guards, seed script, .env.example, README.
   No UI, payments, notifications, or maps yet.
2. Design system: tokens, fonts, Tailwind config, grain, buttons/inputs/cards, motion utils.
3. Public editorial landing page + "Order milk here" form + confirmation with reference.
4. Notification service: BullMQ queue, email, WhatsApp templates, recipients, log.
5. Admin panel: orders table, status workflow, audit log, full-screen live map + WebSockets.
6. Payments: Daraja STK Push (sandbox), idempotent callback, dashboard, reconciliation.
7. Nightly batch, packing list, vehicle caps, rider assignment with draw-to-select.
8. Rider PWA: load counter, route loops, delivery actions, proof photo, GPS, offline queue.
9. Subscriptions, tracking links, reports, performance + accessibility pass.
