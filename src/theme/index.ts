/**
 * Daybook Design System - Unified Theme Export
 *
 * Usage:
 *   import { theme } from '@/theme';
 *   // theme.colors.accent, theme.typography.bodyLarge, etc.
 *
 * Or import individual modules:
 *   import { colors, typography, spacing, shadows, layout } from '@/theme';
 */

export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';
export { layout } from './layout';

// Re-export types
export type { ColorToken } from './colors';
export type { TypographyVariant } from './typography';
export type { SpacingToken } from './spacing';
export type { ShadowPreset } from './shadows';
export type { LayoutToken } from './layout';

// ── Unified theme object ───────────────────────────────────────
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { layout } from './layout';

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  layout,
} as const;
