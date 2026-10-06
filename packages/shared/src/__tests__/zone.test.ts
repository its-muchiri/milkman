import { describe, expect, it } from 'vitest';
import {
  assertWithinRunCap,
  maxPacksForVehicle,
  selectVehicle,
  vehicleForZone,
  zoneForDistance,
} from '../zone';
import {
  BICYCLE_MAX_PACKS_PER_RUN,
  MOTORCYCLE_MAX_PACKS_PER_RUN,
} from '../constants';

describe('zoneForDistance', () => {
  it('maps distances to zones with inclusive boundaries', () => {
    expect(zoneForDistance(0)).toBe('bicycle');
    expect(zoneForDistance(2.5)).toBe('bicycle'); // exactly 2.5 km is still bicycle
    expect(zoneForDistance(2.51)).toBe('motorcycle');
    expect(zoneForDistance(10)).toBe('motorcycle'); // exactly 10 km is still motorcycle
    expect(zoneForDistance(10.01)).toBe('out_of_zone');
    expect(zoneForDistance(52)).toBe('out_of_zone');
  });

  it('rejects negative or non-finite distances', () => {
    expect(() => zoneForDistance(-0.1)).toThrow(RangeError);
    expect(() => zoneForDistance(NaN)).toThrow(RangeError);
  });
});

describe('vehicleForZone', () => {
  it('lets the zone decide the vehicle', () => {
    expect(vehicleForZone('bicycle')).toBe('bicycle');
    expect(vehicleForZone('motorcycle')).toBe('motorcycle');
    expect(vehicleForZone('out_of_zone')).toBeNull();
  });
});

describe('selectVehicle', () => {
  it('assigns a bicycle with a 35-pack cap inside 2.5 km', () => {
    const r = selectVehicle(1.2, 20);
    expect(r).toMatchObject({ vehicle: 'bicycle', zone: 'bicycle', withinCap: true, maxPacks: BICYCLE_MAX_PACKS_PER_RUN });
    expect(r.message).toBeUndefined();
  });

  it('assigns a motorcycle with a 100-pack cap between 2.5 and 10 km', () => {
    const r = selectVehicle(6, 90);
    expect(r).toMatchObject({ vehicle: 'motorcycle', zone: 'motorcycle', withinCap: true, maxPacks: MOTORCYCLE_MAX_PACKS_PER_RUN });
  });

  it('reports over-cap bicycle orders without silently upgrading the vehicle', () => {
    const r = selectVehicle(1, BICYCLE_MAX_PACKS_PER_RUN + 5);
    expect(r.vehicle).toBe('bicycle');
    expect(r.withinCap).toBe(false);
    expect(r.message).toMatch(/35 packs/);
  });

  it('rejects out-of-zone distances with a friendly message', () => {
    const r = selectVehicle(12, 10);
    expect(r.vehicle).toBeNull();
    expect(r.zone).toBe('out_of_zone');
    expect(r.withinCap).toBe(false);
    expect(r.message).toMatch(/beyond our 10 km delivery zone/);
  });

  it('rejects invalid pack counts', () => {
    expect(() => selectVehicle(1, 0)).toThrow(RangeError);
    expect(() => selectVehicle(1, 2.5)).toThrow(RangeError);
  });
});

describe('assertWithinRunCap', () => {
  it('passes at the cap and throws above it', () => {
    expect(() => assertWithinRunCap('bicycle', 35)).not.toThrow();
    expect(() => assertWithinRunCap('bicycle', 36)).toThrow(RangeError);
    expect(() => assertWithinRunCap('motorcycle', 101)).toThrow(RangeError);
  });

  it('exposes per-vehicle caps', () => {
    expect(maxPacksForVehicle('bicycle')).toBe(35);
    expect(maxPacksForVehicle('motorcycle')).toBe(100);
  });
});
