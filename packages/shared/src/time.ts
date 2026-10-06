import {
  ORDER_CUTOFF,
  ORDER_INTAKE_OPEN,
  TIMEZONE_OFFSET_MINUTES,
  DELIVERY_WINDOW_START,
  DELIVERY_WINDOW_END,
} from './constants';

/** Fields of the Africa/Nairobi wall clock (UTC+3, no DST). */
export interface NairobiTimeParts {
  /** Local calendar date, YYYY-MM-DD. */
  isoDate: string;
  hours: number;
  minutes: number;
  /** Minutes since local midnight, 0..1439. */
  minutesOfDay: number;
}

const pad = (n: number, w = 2): string => String(n).padStart(w, '0');

export function toNairobiParts(when: Date): NairobiTimeParts {
  const local = new Date(when.getTime() + TIMEZONE_OFFSET_MINUTES * 60_000);
  const hours = local.getUTCHours();
  const minutes = local.getUTCMinutes();
  return {
    isoDate: `${pad(local.getUTCFullYear(), 4)}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`,
    hours,
    minutes,
    minutesOfDay: hours * 60 + minutes,
  };
}

/** 'HH:MM' → minutes since midnight. */
export function hhmmToMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) throw new RangeError(`Bad time string: "${hhmm}" (expected HH:MM).`);
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) throw new RangeError(`Bad time string: "${hhmm}"`);
  return h * 60 + min;
}

const INTAKE_OPEN_MIN = hhmmToMinutes(ORDER_INTAKE_OPEN);
const CUTOFF_MIN = hhmmToMinutes(ORDER_CUTOFF);
const WINDOW_START_MIN = hhmmToMinutes(DELIVERY_WINDOW_START);
const WINDOW_END_MIN = hhmmToMinutes(DELIVERY_WINDOW_END);

/**
 * Order intake is open daily 08:00–22:00 Africa/Nairobi.
 * The 22:00 cut-off both closes intake for the day and locks orders
 * for next-morning delivery.
 */
export function isOrderIntakeOpen(when: Date): boolean {
  const { minutesOfDay } = toNairobiParts(when);
  return minutesOfDay >= INTAKE_OPEN_MIN && minutesOfDay < CUTOFF_MIN;
}

export type OrderIntakeState = 'open' | 'closed_before_open' | 'after_cutoff';

/** Why intake is closed, for a friendly message on the public form. */
export function orderIntakeState(when: Date): OrderIntakeState {
  const { minutesOfDay } = toNairobiParts(when);
  if (minutesOfDay >= INTAKE_OPEN_MIN && minutesOfDay < CUTOFF_MIN) return 'open';
  return minutesOfDay < INTAKE_OPEN_MIN ? 'closed_before_open' : 'after_cutoff';
}

/**
 * The morning an order is due: placed before the 22:00 cut-off → tomorrow;
 * placed after cut-off (or overnight, defensively) → the morning after that.
 * Returns a YYYY-MM-DD date in Africa/Nairobi.
 */
export function deliveryDateFor(placedAt: Date): string {
  const { isoDate, minutesOfDay } = toNairobiParts(placedAt);
  // Before 08:00 = overnight (after previous day's cut-off) → 2 days
  // 08:00–21:59 = before cut-off → 1 day
  // 22:00+ = after cut-off → 2 days
  const addDays = minutesOfDay < INTAKE_OPEN_MIN || minutesOfDay >= CUTOFF_MIN ? 2 : 1;
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + addDays);
  return d.toISOString().slice(0, 10);
}

/** True while a delivery should be happening: 05:30–08:00 Nairobi time. */
export function isWithinDeliveryWindow(when: Date): boolean {
  const { minutesOfDay } = toNairobiParts(when);
  return minutesOfDay >= WINDOW_START_MIN && minutesOfDay <= WINDOW_END_MIN;
}

/** An order is "late" once the 08:00 delivery window has closed. */
export function isPastDeliveryDeadline(when: Date): boolean {
  return toNairobiParts(when).minutesOfDay > WINDOW_END_MIN;
}
