# Milkman — Development Roadmap

## Current State (Post Phase 2)
- **Frontend**: Next.js 14 + React 18, GSAP/Framer Motion animations, React Three Fiber 3D, Google Maps, Unsplash images, M-Pesa STK Push button, privacy/terms pages, SEO metadata, sitemap, robots.txt, favicon
- **Backend**: NestJS API scaffold with PostGIS schema, migrations, shared package with tests
- **Deployment**: Vercel production at `https://milkman-xi.vercel.app`, GitHub at `https://github.com/its-muchiri/milkman`
- **Known Issues**: React Three Fiber `unstable_act` warning (non-breaking), Google Fonts network timeout in Vercel build (using local fonts as fallback)

---

## Phase 3 — Core Ordering & Payments (MVP Required)
**Target**: End-to-end order flow works reliably.

### 3.1 Order Management
- [ ] `POST /api/orders` creates order with server-side pricing validation
- [ ] Order confirmation email/SMS via Resend/Twilio
- [ ] Order status tracking page (`/orders/[reference]`)
- [ ] Admin order list with status transitions (new → confirmed → packed → out_for_delivery → delivered)
- [ ] Order cancellation before cutoff with refund logic

### 3.2 Payments
- [ ] Implement Daraja STK Push integration (M-Pesa)
  - [ ] `POST /api/daraja/stk-push` initiates payment
  - [ ] `POST /api/daraja/callback` handles M-Pesa response
  - [ ] `POST /api/daraja/validation` and `/api/daraja/confirmation` endpoints
  - [ ] Idempotent payment webhook handling
- [ ] M-Pesa Pochi la Biashara integration for business account
- [ ] Payment status display on confirmation page
- [ ] Failed payment handling with retry option

### 3.3 Delivery & Routing
- [ ] Daily delivery list generation
- [ ] Route optimization (bicycle vs motorcycle)
- [ ] Rider assignment logic
- [ ] Delivery time slot management

### 3.4 Admin Panel
- [ ] Protected admin routes with JWT
- [ ] Dashboard with daily sales, subscriptions, top products
- [ ] Product management (create, edit, stock)
- [ ] Delivery zone management
- [ ] Customer management

---

## Phase 4 — Subscriptions & Notifications
**Target**: Recurring revenue and customer retention.

### 4.1 Subscriptions
- [ ] Subscription creation (daily, alternate days, custom weekdays)
- [ ] Subscription pause/skip/resume/cancel
- [ ] Subscription billing automation
- [ ] Failed payment handling for subscriptions

### 4.2 Notifications
- [ ] WhatsApp Business Cloud API integration
- [ ] Email notifications via Resend
- [ ] SMS notifications via Twilio
- [ ] Order confirmation messages
- [ ] Delivery day reminders

### 4.3 Wallet/Prepaid
- [ ] Wallet top-up via M-Pesa
- [ ] Wallet balance tracking
- [ ] Wallet transaction history
- [ ] Auto-deduction on order placement

---

## Phase 5 — Customer Features
**Target**: Self-service and engagement.

### 5.1 User Accounts
- [ ] Customer registration/login
- [ ] Order history
- [ ] Saved addresses
- [ ] Subscription management

### 5.2 Rider PWA
- [ ] Rider authentication
- [ ] Today's delivery list
- [ ] Mark as delivered/failed
- [ ] Offline-capable delivery list
- [ ] Proof of delivery (photo + signature)

### 5.3 Enhanced Ordering
- [ ] Saved delivery locations
- [ ] Order scheduling (specific time slots)
- [ ] Guest checkout
- [ ] Order modifications before cutoff

---

## Phase 6 — Operations & Scaling
**Target**: Reliability and growth.

### 6.1 Background Jobs
- [ ] BullMQ + Redis for async jobs
- [ ] Subscription order generation cron
- [ ] Daily delivery list generation
- [ ] Reminder notifications
- [ ] Failed payment retry logic

### 6.2 Monitoring & Observability
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Database query logging
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Admin audit log

### 6.3 Infrastructure
- [ ] Staging environment with separate Vercel project
- [ ] Database automated backups
- [ ] Redis persistence
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment variable management

---

## Phase 7 — Advanced Features
**Target**: Competitive advantage.

### 7.1 Inventory Management
- [ ] Batch tracking by expiry date
- [ ] Freshness rules enforcement
- [ ] Expired stock handling
- [ ] Stock alerts

### 7.2 Analytics & Reporting
- [ ] Daily/weekly/monthly sales reports
- [ ] Customer analytics
- [ ] Delivery performance metrics
- [ ] Financial reports

### 7.3 Integrations
- [ ] Accounting software integration
- [ ] Delivery tracking map
- [ ] SMS/USSD for feature phones
- [ ] Loyalty/rewards program

---

## Quality Checklist Compliance

### ✅ Completed
- [x] `.env` in `.gitignore`; no secrets in frontend code
- [x] Pricing constants in shared package
- [x] Form validation on client-side
- [x] SEO metadata, Open Graph, Twitter cards
- [x] `robots.txt`, `sitemap.xml`
- [x] Privacy policy and terms of service pages
- [x] Favicon and logo
- [x] Mobile-responsive design
- [x] Reduced motion media query
- [x] Alt text on images
- [x] Loading states (map loading)

### 🔄 In Progress
- [ ] Server-side pricing validation
- [ ] Authorization checks on all endpoints
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Error tracking
- [ ] Automated backups

### ⏳ Pending
- [ ] Password hashing (bcrypt/argon2)
- [ ] Rate-limited login
- [ ] Password reset flow
- [ ] Webhook idempotency
- [ ] Refund logic
- [ ] Audit log
- [ ] Lighthouse 90+ scores
- [ ] Accessibility audit
- [ ] Load testing
- [ ] Rollback plan

---

## Immediate Next Steps

1. **Fix React Three Fiber warning** (non-breaking, but should address before launch)
2. **Implement `/api/orders` with server-side validation**
3. **Set up Daraja sandbox credentials and test STK Push**
4. **Add `@types/three` to package.json** (done)
5. **Create admin dashboard scaffold**
6. **Add error tracking (Sentry)**
7. **Set up staging environment**
8. **Run quality checklist audit before launch**

---

## Estimated Timeline

- **Phase 3 (MVP)**: 4-6 weeks
- **Phase 4 (Subscriptions)**: 2-3 weeks
- **Phase 5 (Customer Features)**: 3-4 weeks
- **Phase 6 (Operations)**: 2-3 weeks
- **Phase 7 (Advanced)**: Ongoing

**Target Launch**: 8-10 weeks from now (mid-December 2026)
