/**
 * Daybook Design System - Shadow Presets
 *
 * Extremely subtle, iOS-style shadows that barely lift elements
 * off the surface - just enough depth for visual hierarchy.
 */

import { ViewStyle } from 'react-native';

export const shadows = {
  /** Barely perceptible lift - for cards resting on the background */
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  /** Gentle lift - for floating elements, active cards */
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const satisfies Record<string, ViewStyle>;

export type ShadowPreset = keyof typeof shadows;
