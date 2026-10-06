import { describe, expect, it } from 'vitest';
import {
  deliveryDateFor,
  hhmmToMinutes,
  isOrderIntakeOpen,
  isPastDeliveryDeadline,
  isWithinDeliveryWindow,
  orderIntakeState,
  toNairobiParts,
} from '../time';

/** Build a UTC instant from an Africa/Nairobi wall-clock time (UTC+3). */
const nbo = (isoLocal: string): Date =>
  new Date(new Date(`${isoLocal}Z`).getTime() - 3 * 60 * 60 * 1000);

describe('toNairobiParts', () => {
  it('converts UTC instants to the +03 wall clock', () => {
    const p = toNairobiParts(new Date('2026-10-05T23:30:00Z')); // 02:30 next day in NBO
    expect(p.isoDate).toBe('2026-10-06');
    expect(p.hours).toBe(2);
    expect(p.minutesOfDay).toBe(150);
  });
});

describe('hhmmToMinutes', () => {
  it('parses HH:MM and rejects junk', () => {
    expect(hhmmToMinutes('05:30')).toBe(330);
    expect(hhmmToMinutes('22:00')).toBe(1320);
    expect(() => hhmmToMinutes('25:00')).toThrow(RangeError);
    expect(() => hhmmToMinutes('9am')).toThrow(RangeError);
  });
});

describe('order intake window (08:00–22:00)', () => {
  it('is open from 08:00 inclusive to 22:00 exclusive', () => {
    expect(isOrderIntakeOpen(nbo('2026-10-06T08:00'))).toBe(true);
    expect(isOrderIntakeOpen(nbo('2026-10-06T12:00'))).toBe(true);
    expect(isOrderIntakeOpen(nbo('2026-10-06T21:59'))).toBe(true);
    expect(isOrderIntakeOpen(nbo('2026-10-06T22:00'))).toBe(false);
    expect(isOrderIntakeOpen(nbo('2026-10-06T07:59'))).toBe(false);
    expect(isOrderIntakeOpen(nbo('2026-10-06T02:00'))).toBe(false);
  });

  it('explains why it is closed', () => {
    expect(orderIntakeState(nbo('2026-10-06T06:00'))).toBe('closed_before_open');
    expect(orderIntakeState(nbo('2026-10-06T23:00'))).toBe('after_cutoff');
    expect(orderIntakeState(nbo('2026-10-06T10:00'))).toBe('open');
  });
});

describe('deliveryDateFor', () => {
  it('gives orders before the cut-off to tomorrow morning', () => {
    expect(deliveryDateFor(nbo('2026-10-06T09:15'))).toBe('2026-10-07');
    expect(deliveryDateFor(nbo('2026-10-06T21:59'))).toBe('2026-10-07');
  });

  it('defensively moves post-cut-off orders two mornings ahead', () => {
    expect(deliveryDateFor(nbo('2026-10-06T22:30'))).toBe('2026-10-08');
    expect(deliveryDateFor(nbo('2026-10-06T01:00'))).toBe('2026-10-08');
  });

  it('crosses month boundaries correctly', () => {
    expect(deliveryDateFor(nbo('2026-10-31T20:00'))).toBe('2026-11-01');
  });
});

describe('delivery window (05:30–08:00)', () => {
  it('detects the live window and lateness', () => {
    expect(isWithinDeliveryWindow(nbo('2026-10-06T05:30'))).toBe(true);
    expect(isWithinDeliveryWindow(nbo('2026-10-06T07:00'))).toBe(true);
    expect(isWithinDeliveryWindow(nbo('2026-10-06T08:00'))).toBe(true);
    expect(isWithinDeliveryWindow(nbo('2026-10-06T05:29'))).toBe(false);
    expect(isPastDeliveryDeadline(nbo('2026-10-06T08:01'))).toBe(true);
    expect(isPastDeliveryDeadline(nbo('2026-10-06T07:59'))).toBe(false);
  });
});
