import { describe, expect, it } from 'vitest';
import { checkGeofence, haversineKm } from '../geofence';
import { OUT_OF_ZONE_MESSAGE } from '../constants';

// Nairobi CBD as a stand-in depot.
const DEPOT = { lat: -1.286389, lng: 36.817244 };

// ~11.13 km per degree of latitude at the equator; 0.09° ≈ 10 km.
const justInside = { lat: DEPOT.lat - 0.089, lng: DEPOT.lng }; // ≈ 9.9 km
const justOutside = { lat: DEPOT.lat - 0.092, lng: DEPOT.lng }; // ≈ 10.2 km
const westPark = { lat: -1.2676, lng: 36.8074 }; // ≈ 2.3 km NW of depot

describe('haversineKm', () => {
  it('is zero for the same point', () => {
    expect(haversineKm(DEPOT, DEPOT)).toBe(0);
  });

  it('measures a known distance within 1% error', () => {
    // One degree of latitude ≈ 111.19 km (mean earth radius used here).
    const d = haversineKm(DEPOT, { lat: DEPOT.lat + 1, lng: DEPOT.lng });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  it('rejects out-of-range coordinates', () => {
    expect(() => haversineKm({ lat: 95, lng: 0 }, DEPOT)).toThrow(RangeError);
    expect(() => haversineKm(DEPOT, { lat: 0, lng: 190 })).toThrow(RangeError);
  });
});

describe('checkGeofence', () => {
  it('accepts a bicycle-zone pin close to the depot', () => {
    const r = checkGeofence(westPark, DEPOT);
    expect(r.inside).toBe(true);
    expect(r.zone).toBe('bicycle');
    expect(r.vehicle).toBe('bicycle');
    expect(r.message).toBeNull();
  });

  it('accepts a motorcycle-zone pin at ~9.9 km', () => {
    const r = checkGeofence(justInside, DEPOT);
    expect(r.inside).toBe(true);
    expect(r.zone).toBe('motorcycle');
    expect(r.vehicle).toBe('motorcycle');
  });

  it('rejects pins beyond 10 km with the friendly message', () => {
    const r = checkGeofence(justOutside, DEPOT);
    expect(r.inside).toBe(false);
    expect(r.zone).toBe('out_of_zone');
    expect(r.vehicle).toBeNull();
    expect(r.message).toBe(OUT_OF_ZONE_MESSAGE);
  });
});
