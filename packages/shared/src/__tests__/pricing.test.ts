import { describe, expect, it } from 'vitest';
import { addonsTotalKsh, formatKsh, orderTotalKsh, packsTotalKsh, PricingError } from '../pricing';
import { PACK_PRICE_KSH } from '../constants';

describe('packsTotalKsh', () => {
  it('prices every pack at KSh 50', () => {
    expect(packsTotalKsh(1)).toBe(PACK_PRICE_KSH);
    expect(packsTotalKsh(3)).toBe(150); // "3 packs = KSh 150"
    expect(packsTotalKsh(35)).toBe(1750);
  });

  it('rejects zero, negative, fractional and non-numeric packs', () => {
    for (const bad of [0, -5, 2.5, NaN, Infinity]) {
      expect(() => packsTotalKsh(bad)).toThrow(PricingError);
    }
  });
});

describe('addonsTotalKsh', () => {
  const yoghurt = { addonId: 'a1', name: 'Yoghurt 500ml', unitPriceKsh: 100, qty: 2 };

  it('sums fixed-price add-on lines', () => {
    expect(addonsTotalKsh([yoghurt])).toBe(200);
    expect(addonsTotalKsh([])).toBe(0);
    expect(addonsTotalKsh()).toBe(0);
  });

  it('rejects bad quantities and prices', () => {
    expect(() => addonsTotalKsh([{ ...yoghurt, qty: 0 }])).toThrow(PricingError);
    expect(() => addonsTotalKsh([{ ...yoghurt, qty: 1.5 }])).toThrow(PricingError);
    expect(() => addonsTotalKsh([{ ...yoghurt, unitPriceKsh: 0 }])).toThrow(PricingError);
  });
});

describe('orderTotalKsh', () => {
  it('is packs x 50 plus add-ons', () => {
    expect(orderTotalKsh(4)).toBe(200);
    expect(orderTotalKsh(3, [{ addonId: 'a1', unitPriceKsh: 100, qty: 1 }])).toBe(250);
  });
});

describe('formatKsh', () => {
  it('renders whole-shilling labels', () => {
    expect(formatKsh(150)).toBe('KSh 150');
    expect(formatKsh(1250)).toBe('KSh 1,250');
    expect(() => formatKsh(150.5)).toThrow(PricingError);
  });
});
