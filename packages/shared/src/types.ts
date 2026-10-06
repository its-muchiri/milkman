/**
 * The Milkman — shared types mirroring the PostgreSQL enums.
 * Keep in sync with migration 0001 (CREATE TYPE ...).
 */

export type UserRole = 'admin' | 'rider';
export type AdminPermission = 'depot' | 'finance';

export type OrderSource = 'website' | 'whatsapp' | 'call' | 'admin' | 'subscription';

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'failed'
  | 'refunded'
  | 'expired';

export type ZoneKind = 'bicycle' | 'motorcycle' | 'out_of_zone';
export type VehicleKind = 'bicycle' | 'motorcycle';

export type SubscriptionFrequency = 'daily' | 'alternate_days' | 'custom_weekdays';

export type WalletTxnType = 'top_up' | 'purchase' | 'refund' | 'adjustment';
export type PaymentMethod = 'mpesa_stk' | 'mpesa_till' | 'wallet' | 'cash_on_delivery';

export type DeliveryStatus = 'pending' | 'delivered' | 'failed';
export type DeliveryFailReason = 'door_locked' | 'unreachable' | 'other';

export type NotificationChannel = 'email' | 'whatsapp';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'skipped';

/** The happy-path lifecycle defined by the spec. */
export const ORDER_STATUS_FLOW: readonly OrderStatus[] = [
  'new',
  'confirmed',
  'packed',
  'out_for_delivery',
  'delivered',
] as const;

/** Side exits available from most states. */
export const ORDER_STATUS_SIDE_EXITS: readonly OrderStatus[] = [
  'failed',
  'cancelled',
] as const;

/** A WGS-84 coordinate pair. */
export interface GeoPoint {
  lat: number;
  lng: number;
}
