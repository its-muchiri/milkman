/**
 * Kenyan phone normalization.
 * Accepted inputs: 07xx xxx xxx, 01xx xxx xxx, +2547xxxxxxxx, 2547xxxxxxxx,
 * with spaces, dashes or dots as separators.
 * Output: E.164 '+2547XXXXXXXX' / '+2541XXXXXXXX'. Returns null when invalid.
 */
export function normalizeKePhone(input: string): string | null {
  if (!input) return null;
  const digits = input.replace(/[^\d+]/g, '');

  let rest: string | null = null;
  if (digits.startsWith('+254')) rest = digits.slice(4);
  else if (digits.startsWith('254')) rest = digits.slice(3);
  else if (/^0[17]/.test(digits)) rest = digits.slice(1);

  if (rest === null) return null;
  // Subscriber numbers are 9 digits starting with 7 (Safaricom et al.) or 1.
  if (!/^[71]\d{8}$/.test(rest)) return null;
  return `+254${rest}`;
}

/** True when the input is a usable Kenyan mobile number. */
export function isValidKePhone(input: string): boolean {
  return normalizeKePhone(input) !== null;
}
