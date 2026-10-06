/**
 * Phase 1 seed: 1 admin, 2 riders, sample products/add-ons, depot setting,
 * customers with zoned addresses, wallets (append-only ledger), subscriptions
 * and a few sample orders with items and status history.
 *
 * Usage: npm run seed   (after npm run migrate)
 * Idempotent: exits early if the admin user already exists.
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { buildDataSourceOptions } from '../data-source';
import { User } from '../entities/user.entity';
import { Customer, Address } from '../entities/customer.entity';
import { Product, Addon } from '../entities/catalog.entity';
import { Order, OrderItem, OrderStatusHistory, Subscription } from '../entities/order.entity';
import { Wallet, WalletTransaction, Setting, AuditLogEntry } from '../entities/money.entity';
import {
  PACK_PRICE_KSH,
  checkGeofence,
  deliveryDateFor,
  normalizeKePhone,
  orderTotalKsh,
  toNairobiParts,
} from '@milkman/shared';

// ── helpers ───────────────────────────────────────────────────────────
const env = (key: string, fallback: string): string => process.env[key] ?? fallback;

/** Offset a point due south/north by `km` (1° lat ≈ 111.19 km — good enough for seeds). */
function kmFromDepot(latOffsetKm: number, lngOffsetKm = 0) {
  const depot = { lat: Number(env('DEPOT_LAT', '-1.286389')), lng: Number(env('DEPOT_LNG', '36.817244')) };
  return {
    lat: depot.lat + latOffsetKm / 111.19,
    lng: depot.lng + lngOffsetKm / (111.19 * Math.cos((depot.lat * Math.PI) / 180)),
  };
}

const geo = (p: { lat: number; lng: number }) => ({
  type: 'Point' as const,
  coordinates: [Number(p.lng.toFixed(7)), Number(p.lat.toFixed(7))], // GeoJSON is [lng, lat]
});

async function main(): Promise<void> {
  const ds = new DataSource(buildDataSourceOptions());
  await ds.initialize();
  console.log('Connected to', env('DATABASE_NAME', 'milkman'));

  const users = ds.getRepository(User);
  const adminEmail = env('SEED_ADMIN_EMAIL', 'admin@milkman.co.ke');

  const existing = await users.findOne({ where: { email: adminEmail } });
  if (existing) {
    console.log('Seed already present (admin exists). Skipping.');
    await ds.destroy();
    return;
  }

  const depot = { lat: Number(env('DEPOT_LAT', '-1.286389')), lng: Number(env('DEPOT_LNG', '36.817244')) };
  const adminPassword = env('SEED_ADMIN_PASSWORD', 'ChangeMe_Admin_254');
  const riderPassword = env('SEED_RIDER_PASSWORD', 'ChangeMe_Rider_254');

  await ds.transaction(async (em) => {
    // ── users: 1 admin + 2 riders ─────────────────────────────────────
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const riderHash = await bcrypt.hash(riderPassword, 10);

    const admin = await em.save(
      em.create(User, {
        role: 'admin',
        name: 'Mama Milk Admin',
        email: adminEmail,
        passwordHash: adminHash,
        adminPerms: ['depot', 'finance'],
      }),
    );

    const riderPhones = [
      normalizeKePhone(env('SEED_RIDER_PHONE_1', '+254700111001'))!,
      normalizeKePhone(env('SEED_RIDER_PHONE_2', '+254700111002'))!,
    ];
    const [riderBike, riderMoto] = await Promise.all(
      ['Otala Bike', 'Simiya Moto'].map((name, i) =>
        em.save(
          em.create(User, { role: 'rider', name, phone: riderPhones[i], passwordHash: riderHash }),
        ),
      ),
    );

    // ── depot location in settings ────────────────────────────────────
    await em.save(
      em.create(Setting, { key: 'depot', value: { ...depot, name: 'Main Depot' }, updatedBy: admin.id }),
    );

    // ── catalog ───────────────────────────────────────────────────────
    const milkPack = await em.save(
      em.create(Product, { name: 'Fresh Milk Pack (500 ml)', packSizeMl: 500, isPackBased: true }),
    );
    const [yoghurt, mala] = await Promise.all([
      em.save(em.create(Addon, { name: 'Yoghurt 500 ml', priceKsh: 100 })),
      em.save(em.create(Addon, { name: 'Mala 500 ml', priceKsh: 100 })),
    ]);

    // ── customers + zoned addresses ───────────────────────────────────
    const people = [
      { name: 'Wanjiru Kamau', phone: '0712000101', at: kmFromDepot(1.2) },        // bicycle
      { name: 'Otieno Odhiambo', phone: '0115000202', at: kmFromDepot(0.6, 0.4) }, // bicycle
      { name: 'Amina Hassan', phone: '0733000303', at: kmFromDepot(-5.0) },        // motorcycle
      { name: 'Kevin Mwangi', phone: '0701000404', at: kmFromDepot(8.5, 1.0) },    // motorcycle
    ];

    const customers: Customer[] = [];
    const addresses: Address[] = [];
    for (const p of people) {
      const customer = await em.save(
        em.create(Customer, {
          name: p.name,
          phone: normalizeKePhone(p.phone)!,
          createdBy: admin.id,
          consentMarketing: true,
          consentAt: new Date(),
        }),
      );
      const fence = checkGeofence(p.at, depot);
      const address = await em.save(
        em.create(Address, {
          customerId: customer.id,
          label: 'Home',
          landmark: 'Near the shopping centre',
          point: geo(p.at) as never,
          distanceM: Math.round(fence.distanceKm * 1000),
          zone: fence.zone,
          vehicle: fence.vehicle,
        }),
      );
      customers.push(customer);
      addresses.push(address);
    }

    // ── wallets (append-only ledger) ──────────────────────────────────
    const topUps = [
      { credit: 500, spend: 150 }, // Wanjiru → 350
      { credit: 300, spend: 0 },   // Otieno → 300
      { credit: 400, spend: 200 }, // Amina  → 200
      { credit: 200, spend: 150 }, // Kevin  → 50 (below the KSh 100 alert line)
    ];
    for (let i = 0; i < customers.length; i++) {
      const wallet = await em.save(em.create(Wallet, { customerId: customers[i].id }));
      let balance = 0;
      balance += topUps[i].credit;
      await em.save(
        em.create(WalletTransaction, {
          walletId: wallet.id,
          txnType: 'top_up',
          deltaKsh: topUps[i].credit,
          balanceAfterKsh: balance,
          idempotencyKey: `seed-topup-${customers[i].phone}`,
          createdBy: admin.id,
        }),
      );
      if (topUps[i].spend > 0) {
        balance -= topUps[i].spend;
        await em.save(
          em.create(WalletTransaction, {
            walletId: wallet.id,
            txnType: 'purchase',
            deltaKsh: -topUps[i].spend,
            balanceAfterKsh: balance,
            idempotencyKey: `seed-purchase-${customers[i].phone}`,
          }),
        );
      }
    }

    // ── subscriptions ─────────────────────────────────────────────────
    const startsOn = toNairobiParts(new Date()).isoDate;
    const subWanjiru = await em.save(
      em.create(Subscription, {
        customerId: customers[0].id,
        addressId: addresses[0].id,
        packsPerDelivery: 2,
        frequency: 'daily',
        startsOn,
      }),
    );
    const subAmina = await em.save(
      em.create(Subscription, {
        customerId: customers[2].id,
        addressId: addresses[2].id,
        packsPerDelivery: 3,
        frequency: 'custom_weekdays',
        weekdays: [1, 3, 5],
        startsOn,
      }),
    );

    // ── orders (one-time) with items + history ────────────────────────
    const now = new Date();
    const deliveryDate = deliveryDateFor(now);

    const orderSeeds = [
      { customer: 0, packs: 3, addon: null as Addon | null, status: 'new' as const },
      { customer: 2, packs: 6, addon: yoghurt, status: 'confirmed' as const },
      { customer: 3, packs: 10, addon: mala, status: 'new' as const },
    ];

    for (const s of orderSeeds) {
      const customer = customers[s.customer];
      const address = addresses[s.customer];
      const fence = checkGeofence(
        { lat: address.point.coordinates[1], lng: address.point.coordinates[0] },
        depot,
      );
      const addons = s.addon ? [{ addonId: s.addon.id, unitPriceKsh: s.addon.priceKsh, qty: 1 }] : [];
      const total = orderTotalKsh(s.packs, addons);

      const order = await em.save(
        em.create(Order, {
          reference: undefined as never, // DB default: 'MLK-' || nextval(sequence)
          customerId: customer.id,
          addressId: address.id,
          subscriptionId: s.customer === 0 ? subWanjiru.id : s.customer === 2 ? subAmina.id : null,
          source: 'website',
          status: s.status,
          paymentStatus: 'pending',
          packs: s.packs,
          totalKsh: total,
          deliveryPoint: address.point,
          zone: fence.zone,
          vehicle: fence.vehicle,
          deliveryDate,
          note: 'Leave with the guard',
          placedAt: now,
        }),
      );
      // reference has a DB-generated default; fetch it back for the audit trail.
      const [saved] = await em.query(
        `SELECT reference FROM orders WHERE id = $1`,
        [order.id],
      );
      order.reference = saved.reference;

      await em.save(
        em.create(OrderItem, {
          orderId: order.id,
          productId: milkPack.id,
          qty: s.packs,
          unitPriceKsh: PACK_PRICE_KSH,
        }),
      );
      if (s.addon) {
        await em.save(
          em.create(OrderItem, {
            orderId: order.id,
            addonId: s.addon.id,
            qty: 1,
            unitPriceKsh: s.addon.priceKsh,
          }),
        );
      }

      await em.save(
        em.create(OrderStatusHistory, {
          orderId: order.id,
          fromStatus: null,
          toStatus: 'new',
          changedBy: null,
          note: 'placed via seed',
        }),
      );
      if (s.status === 'confirmed') {
        await em.save(
          em.create(OrderStatusHistory, {
            orderId: order.id,
            fromStatus: 'new',
            toStatus: 'confirmed',
            changedBy: admin.id,
            note: 'confirmed by seed',
          }),
        );
      }

      await em.save(
        em.create(AuditLogEntry, {
          actorId: admin.id,
          action: 'order.created',
          entityType: 'orders',
          entityId: order.id,
          after: { reference: order.reference, packs: s.packs, totalKsh: total },
        }),
      );
    }

    console.log(
      [
        `Seeded: admin ${adminEmail}, riders ${riderPhones.join(', ')}`,
        `Products: ${milkPack.name}; add-ons: ${yoghurt.name}, ${mala.name}`,
        `Customers: ${customers.length}; orders: ${orderSeeds.length}; delivery date: ${deliveryDate}`,
        `Login passwords come from SEED_ADMIN_PASSWORD / SEED_RIDER_PASSWORD in .env`,
      ].join('\n'),
    );
    void riderBike;
    void riderMoto;
  });

  await ds.destroy();
}

main().catch((err) => {
  console.error('Seed failed:', err.message ?? err);
  process.exit(1);
});
