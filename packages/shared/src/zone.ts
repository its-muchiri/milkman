import {
  BICYCLE_MAX_DISTANCE_KM,
  BICYCLE_MAX_PACKS_PER_RUN,
  MOTORCYCLE_MAX_PACKS_PER_RUN,
  GEOFENCE_MAX_KM,
} from './constants';
import type { VehicleKind, ZoneKind } from './types';

/**
 * Zone from distance to depot (km).
 * 0 – 2.5 km  → bicycle zone
 * 2.5 – 10 km → motorcycle zone
 * > 10 km     → out_of_zone (pins beyond 10 km are rejected)
 * Boundary rule: exactly 2.5 km is still bicycle; exactly 10 km is still motorcycle.
 */
export function zoneForDistance(distanceKm: number): ZoneKind {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new RangeError('distanceKm must be a finite, non-negative number.');
  }
  if (distanceKm <= BICYCLE_MAX_DISTANCE_KM) return 'bicycle';
  if (distanceKm <= GEOFENCE_MAX_KM) return 'motorcycle';
  return 'out_of_zone';
}

/** The zone decides the vehicle. Out-of-zone pins have no vehicle. */
export function vehicleForZone(zone: ZoneKind): VehicleKind | null {
  if (zone === 'bicycle') return 'bicycle';
  if (zone === 'motorcycle') return 'motorcycle';
  return null;
}

export function maxPacksForVehicle(vehicle: VehicleKind): number {
  return vehicle === 'bicycle' ? BICYCLE_MAX_PACKS_PER_RUN : MOTORCYCLE_MAX_PACKS_PER_RUN;
}

export interface VehicleSelection {
  vehicle: VehicleKind | null;
  zone: ZoneKind;
  /** True when the requested pack count fits one run of the assigned vehicle. */
  withinCap: boolean;
  maxPacks: number | null;
  /** Present when the order cannot be served as-is. Safe to show to users. */
  message?: string;
}

/**
 * Select the vehicle from distance and pack count, enforcing run caps.
 * The zone decides the vehicle; exceeding the cap is reported, never silently
 * upgraded (a bicycle-zone order of 40 packs must be split, not given a moto).
 */
export function selectVehicle(distanceKm: number, packs: number): VehicleSelection {
  if (!Number.isInteger(packs) || packs <= 0) {
    throw new RangeError('packs must be a positive whole number.');
  }
  const zone = zoneForDistance(distanceKm);
  const vehicle = vehicleForZone(zone);
  if (vehicle === null) {
    return {
      vehicle: null,
      zone,
      withinCap: false,
      maxPacks: null,
      message: `This address is ${distanceKm.toFixed(1)} km from the depot, beyond our ${GEOFENCE_MAX_KM} km delivery zone.`,
    };
  }
  const maxPacks = maxPacksForVehicle(vehicle);
  const withinCap = packs <= maxPacks;
  return {
    vehicle,
    zone,
    withinCap,
    maxPacks,
    ...(withinCap
      ? {}
      : {
          message:
            vehicle === 'bicycle'
              ? `A bicycle carries at most ${maxPacks} packs. Split the order or bring the pin inside the motorcycle zone.`
              : `A motorcycle carries at most ${maxPacks} packs per run.`,
        }),
  };
}

/** Guard used when building delivery runs (Phase 7). */
export function assertWithinRunCap(vehicle: VehicleKind, packsTotal: number): void {
  const max = maxPacksForVehicle(vehicle);
  if (packsTotal > max) {
    throw new RangeError(`${vehicle} run exceeds cap: ${packsTotal} > ${max} packs.`);
  }
}
