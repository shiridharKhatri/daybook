/**
 * Daybook Design System - Spacing Scale
 *
 * Consistent spacing tokens based on a 4-point grid.
 */

export const spacing = {
  /** 4px - hairline gaps, icon padding */
  xs: 4,
  /** 8px - tight element gaps */
  sm: 8,
  /** 12px - compact item spacing */
  md: 12,
  /** 16px - default inner padding */
  lg: 16,
  /** 20px - screen horizontal padding */
  xl: 20,
  /** 24px - section separators */
  '2xl': 24,
  /** 32px - large section gaps */
  '3xl': 32,
  /** 40px - extra spacing */
  '4xl': 40,
  /** 48px - generous spacing */
  '5xl': 48,
  /** 64px - hero / header spacing */
  '6xl': 64,
} as const;

export type SpacingToken = keyof typeof spacing;
