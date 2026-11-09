/**
 * Daybook Design System - Color Tokens
 *
 * All color values used throughout the app.
 * Import from `@/theme` rather than this file directly.
 */

export const colors = {
  // ── Backgrounds ──────────────────────────────────────────────
  /** Primary screen background */
  background: '#FAF8F4',
  /** Card / surface background */
  card: '#FFFFFF',
  /** Tab bar background */
  tabBar: '#FFFFFF',

  // ── Text ─────────────────────────────────────────────────────
  /** Primary text - headings, body copy */
  textPrimary: '#34312F',
  /** Secondary text - subtitles, metadata */
  textSecondary: '#88827E',
  /** Tertiary text - placeholders, disabled labels */
  textTertiary: '#B5AFA8',

  // ── Accent ───────────────────────────────────────────────────
  /** Dusty rose - primary brand accent */
  accent: '#E9C5BE',
  /** Warm amber - secondary accent, highlights */
  accentSecondary: '#E8B36F',

  // ── Borders & Dividers ───────────────────────────────────────
  /** Subtle border / divider */
  border: '#EEEAE5',

  // ── Semantic ─────────────────────────────────────────────────
  /** Success state */
  success: '#8DB580',
  /** Error / destructive state */
  error: '#D4736C',
  /** Warning state */
  warning: '#E8B36F',
  /** Informational state */
  info: '#8BB0C4',

  // ── Overlay ──────────────────────────────────────────────────
  /** Modal / bottom-sheet overlay scrim */
  overlay: 'rgba(0,0,0,0.3)',

  // ── Misc ─────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
