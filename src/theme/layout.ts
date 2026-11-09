/**
 * Daybook Design System - Layout Constants
 *
 * Consistent layout values for screens, cards, and content regions.
 */

export const layout = {
  /** Horizontal padding for screen edges */
  screenPadding: 20,
  /** Inner padding for cards and surfaces */
  cardPadding: 16,
  /** Vertical gap between major sections */
  sectionGap: 24,
  /** Vertical gap between list items */
  itemGap: 12,

  // ── Border Radii ─────────────────────────────────────────────
  /** Card corner radius */
  cardRadius: 20,
  /** Button corner radius */
  buttonRadius: 20,
  /** Text input corner radius */
  inputRadius: 14,
  /** Bottom sheet corner radius */
  bottomSheetRadius: 28,
} as const;

export type LayoutToken = keyof typeof layout;
