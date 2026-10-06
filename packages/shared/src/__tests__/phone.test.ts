import { describe, expect, it } from 'vitest';
import { isValidKePhone, normalizeKePhone } from '../phone';

describe('normalizeKePhone', () => {
  it('normalizes local and international formats to E.164', () => {
    const expected = '+254712345678';
    expect(normalizeKePhone('0712345678')).toBe(expected);
    expect(normalizeKePhone('0712 345 678')).toBe(expected);
    expect(normalizeKePhone('0712-345-678')).toBe(expected);
    expect(normalizeKePhone('+254712345678')).toBe(expected);
    expect(normalizeKePhone('+254 712 345 678')).toBe(expected);
    expect(normalizeKePhone('254712345678')).toBe(expected);
    expect(normalizeKePhone('+2540712345678')).toBeNull(); // double trunk prefix
  });

  it('accepts 01xx (new Safaricom) prefixes', () => {
    expect(normalizeKePhone('0112345678')).toBe('+254112345678');
  });

  it('rejects non-Kenyan, short, long or landline numbers', () => {
    expect(normalizeKePhone('0800124567')).toBeNull(); // toll-free, not 07/01
    expect(normalizeKePhone('+1 415 555 0100')).toBeNull(); // US number
    expect(normalizeKePhone('071234567')).toBeNull(); // too short
    expect(normalizeKePhone('07123456789')).toBeNull(); // too long
    expect(normalizeKePhone('')).toBeNull();
    expect(normalizeKePhone('not a phone')).toBeNull();
  });

  it('isValidKePhone agrees with the normalizer', () => {
    expect(isValidKePhone('0712345678')).toBe(true);
    expect(isValidKePhone('0999999999')).toBe(false);
  });
});
