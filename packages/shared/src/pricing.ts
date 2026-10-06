import { PACK_PRICE_KSH } from './constants';

/** Thrown for invalid pricing inputs; message is safe to show to users. */
export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PricingError';
  }
}

/** A line of add-ons already resolved against the catalog (e.g. yoghurt KSh 100). */
export interface AddonLine {
  addonId: string;
  name?: string;
  unitPriceKsh: number;
  qty: number;
}

/** Packs part of an order: packs x KSh 50. */
export function packsTotalKsh(packs: number): number {
  if (!Number.isInteger(packs) || packs <= 0) {
    throw new PricingError('Packs must be a positive whole number.');
  }
  return packs * PACK_PRICE_KSH;
}

/** Sum of fixed-price add-on lines. */
export function addonsTotalKsh(addons: readonly AddonLine[] = []): number {
  let total = 0;
  for (const line of addons) {
    if (!Number.isInteger(line.qty) || line.qty <= 0) {
      throw new PricingError(`Add-on "${line.name ?? line.addonId}" quantity must be a positive whole number.`);
    }
    if (!Number.isInteger(line.unitPriceKsh) || line.unitPriceKsh <= 0) {
      throw new PricingError(`Add-on "${line.name ?? line.addonId}" price must be a positive amount.`);
    }
    total += line.qty * line.unitPriceKsh;
  }
  return total;
}

/**
 * Full order total: packs x 50 plus fixed-price add-ons.
 * "3 packs = KSh 150" — the live total shown on the public form.
 */
export function orderTotalKsh(packs: number, addons: readonly AddonLine[] = []): number {
  return packsTotalKsh(packs) + addonsTotalKsh(addons);
}

/** Human label used across surfaces, e.g. "KSh 150". */
export function formatKsh(amountKsh: number): string {
  if (!Number.isInteger(amountKsh)) {
    throw new PricingError('KSh amounts must be whole numbers (no cents in this business).');
  }
  return `KSh ${amountKsh.toLocaleString('en-KE')}`;
}
