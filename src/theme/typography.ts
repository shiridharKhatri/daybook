/**
 * Daybook Design System - Typography Scale
 *
 * Uses iOS system font (SF Pro) via the default React Native fontFamily.
 * Each preset defines fontSize, fontWeight, and lineHeight.
 */

import { TextStyle } from 'react-native';

/** Font-weight aliases mapped to React Native numeric strings */
const weight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const typography = {
  displayLarge: {
    fontSize: 32,
    fontWeight: weight.bold,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: weight.bold,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontSize: 24,
    fontWeight: weight.semibold,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  headingLarge: {
    fontSize: 22,
    fontWeight: weight.semibold,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  headingMedium: {
    fontSize: 18,
    fontWeight: weight.semibold,
    lineHeight: 24,
    letterSpacing: 0,
  },
  headingSmall: {
    fontSize: 16,
    fontWeight: weight.semibold,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 17,
    fontWeight: weight.regular,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: weight.regular,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: weight.regular,
    lineHeight: 18,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: weight.regular,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  label: {
    fontSize: 14,
    fontWeight: weight.medium,
    lineHeight: 20,
    letterSpacing: 0,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
