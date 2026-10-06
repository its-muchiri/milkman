/**
 * The Milkman — business constants.
 * Single source of truth for pricing, zones, caps and times.
 * All times are local to Africa/Nairobi (UTC+3, no DST).
 */

// ── Product / pricing ────────────────────────────────────────────────
/** Every product is a standardized pack at KSh 50. */
export const PACK_PRICE_KSH = 50;
/** Nominal volume of one pack. */
export const PACK_SIZE_ML = 500;
/** Nominal mass of one pack (~0.5 kg), used for run-load planning. */
export const PACK_WEIGHT_KG = 0.5;
/** Wallet balance below this triggers a low-balance alert. */
export const LOW_WALLET_BALANCE_ALERT_KSH = 100;

// ── Zones / vehicles ─────────────────────────────────────────────────
export const BICYCLE_MAX_DISTANCE_KM = 2.5;
export const BICYCLE_MAX_PACKS_PER_RUN = 35;
export const MOTORCYCLE_MAX_DISTANCE_KM = 10;
export const MOTORCYCLE_MAX_PACKS_PER_RUN = 100;
/** Beyond this distance from the depot, pins are rejected. */
export const GEOFENCE_MAX_KM = MOTORCYCLE_MAX_DISTANCE_KM;

/** Friendly out-of-zone message required by the spec. */
export const OUT_OF_ZONE_MESSAGE = "We don't reach you yet — come back soon!";

// ── Daily clock (Africa/Nairobi) ─────────────────────────────────────
export const TIMEZONE = 'Africa/Nairobi';
/** UTC offset of Africa/Nairobi in minutes. No DST, so a constant is safe. */
export const TIMEZONE_OFFSET_MINUTES = 3 * 60;
/** Orders are accepted from 08:00 … */
export const ORDER_INTAKE_OPEN = '08:00';
/** … and cut off at 22:00 (orders lock for next-morning delivery). */
export const ORDER_CUTOFF = '22:00';
/** Delivery window the following morning. */
export const DELIVERY_WINDOW_START = '05:30';
export const DELIVERY_WINDOW_END = '08:00';
/** Daily summary alert time (admin). */
export const DAILY_SUMMARY_AT = '09:00';

// ── Order reference ──────────────────────────────────────────────────
/** Orders look like MLK-1042; the DB sequence starts at 1000. */
export const ORDER_REFERENCE_PREFIX = 'MLK-';
