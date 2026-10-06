import type { Config } from 'tailwindcss';

/**
 * Phase 1: bare Tailwind wiring only.
 * The milk-themed design tokens (palette, fonts, grain) land in Phase 2.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
