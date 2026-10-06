import { OUT_OF_ZONE_MESSAGE } from './constants';
import { zoneForDistance, vehicleForZone } from './zone';
import type { GeoPoint, VehicleKind, ZoneKind } from './types';

const EARTH_RADIUS_KM = 6371.0088;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance between two WGS-84 points, in km (haversine). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  assertPoint(a);
  assertPoint(b);
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function assertPoint(p: GeoPoint): void {
  if (
    !p ||
    !Number.isFinite(p.lat) ||
    !Number.isFinite(p.lng) ||
    Math.abs(p.lat) > 90 ||
    Math.abs(p.lng) > 180
  ) {
    throw new RangeError('Invalid coordinate: expected { lat: -90..90, lng: -180..180 }.');
  }
}

export interface GeofenceResult {
  inside: boolean;
  distanceKm: number;
  zone: ZoneKind;
  vehicle: VehicleKind | null;
  /** Friendly message shown instead of a failed order when outside the fence. */
  message: string | null;
}

/**
 * Instant geofence check for a tapped pin, relative to the depot.
 * Beyond 10 km → rejected with a friendly message; the zone decides the vehicle.
 * In production the authoritative check runs in PostGIS (ST_DistanceSphere);
 * this pure version backs the client-side instant feedback and unit tests.
 */
export function checkGeofence(point: GeoPoint, depot: GeoPoint): GeofenceResult {
  const distanceKm = haversineKm(point, depot);
  const zone = zoneForDistance(distanceKm);
  const vehicle = vehicleForZone(zone);
  return {
    inside: zone !== 'out_of_zone',
    distanceKm,
    zone,
    vehicle,
    message: zone === 'out_of_zone' ? OUT_OF_ZONE_MESSAGE : null,
  };
}
