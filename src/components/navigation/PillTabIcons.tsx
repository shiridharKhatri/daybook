import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export interface TabIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

/**
 * 1. Home - Soft arched dome sanctuary house with curved door
 */
export function PillHomeIcon({ size = 22, color = '#34312F', focused = false }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Curved dome roof and body */}
      <Path
        d="M4.5 11.2C4.5 6.9 7.85 3.5 12 3.5s7.5 3.4 7.5 7.7V17.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-6.3z"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth={focused ? 0 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Curved arched doorway */}
      <Path
        d="M10 20.5v-3.8a2 2 0 0 1 4 0v3.8"
        fill={focused ? '#FFFFFF' : 'none'}
        stroke={focused ? '#FFFFFF' : color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chimney */}
      <Path
        d="M16.5 4.8v1.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 2. Library - Curved open journal with organic rounded pages
 */
export function PillLibraryIcon({ size = 22, color = '#34312F', focused = false }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Left curved page */}
      <Path
        d="M12 6.8c-2-1.7-4.2-2.1-7-2.1A1.7 1.7 0 0 0 3.3 6.4v10.8a1.2 1.2 0 0 0 1.2 1.2c2.5 0 4.6.4 6.5 2M12 6.8v13.6"
        fill={focused ? `${color}20` : 'none'}
        stroke={color}
        strokeWidth={focused ? 2.1 : 1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right curved page */}
      <Path
        d="M12 6.8c2-1.7 4.2-2.1 7-2.1A1.7 1.7 0 0 1 20.7 6.4v10.8a1.2 1.2 0 0 1-1.2 1.2c-2.5 0-4.6.4-6.5 2"
        fill={focused ? `${color}20` : 'none'}
        stroke={color}
        strokeWidth={focused ? 2.1 : 1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Delicate ribbon bookmark */}
      <Path
        d="M12 4.2v4.5l1.5-1 1.5 1V4.2"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 3. AI Assistant - Friendly rounded mascot robot with curved smile
 */
export function PillAssistantIcon({ size = 22, color = '#34312F', focused = false }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer rounded squircle face */}
      <Rect
        x="3.8"
        y="6.2"
        width="16.4"
        height="13.2"
        rx="5"
        fill={focused ? `${color}18` : 'none'}
        stroke={color}
        strokeWidth={focused ? 2.1 : 1.85}
      />
      {/* Cute antenna with rounded tip */}
      <Path
        d="M12 6.2V4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle
        cx="12"
        cy="3"
        r="1.4"
        fill={color}
      />
      {/* Friendly rounded eyes */}
      <Circle cx="8.3" cy="11.4" r="1.4" fill={color} />
      <Circle cx="15.7" cy="11.4" r="1.4" fill={color} />
      {/* Sweet curved smile */}
      <Path
        d="M10.2 14.4c.9 1 2.7 1 3.6 0"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      {/* Side rounded ear buds */}
      <Path
        d="M2.6 11.2v3.2M21.4 11.2v3.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 4. Tasks & Rituals - Curved squircle checklist with rounded checkmark
 */
export function PillTasksIcon({ size = 22, color = '#34312F', focused = false }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer curved pad */}
      <Rect
        x="3.8"
        y="4"
        width="16.4"
        height="16.5"
        rx="4.8"
        fill={focused ? `${color}18` : 'none'}
        stroke={color}
        strokeWidth={focused ? 2.1 : 1.85}
      />
      {/* Top rounded clip */}
      <Path
        d="M8.5 4V2.8a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      {/* Curved bold checkmark */}
      <Path
        d="M7.8 11.8l2.6 2.6 6-6"
        stroke={color}
        strokeWidth={focused ? 2.3 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Subtle lower task line */}
      <Path
        d="M7.8 16.5h8.4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 5. Finance - Curved wallet capsule with rounded clasp
 */
export function PillFinanceIcon({ size = 22, color = '#34312F', focused = false }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Curved wallet body */}
      <Rect
        x="3"
        y="5.5"
        width="18"
        height="14"
        rx="4.2"
        fill={focused ? `${color}18` : 'none'}
        stroke={color}
        strokeWidth={focused ? 2.1 : 1.85}
      />
      {/* Upper curved separator seam */}
      <Path
        d="M3 10.2h18"
        stroke={color}
        strokeWidth={1.6}
      />
      {/* Rounded lock / card clasp */}
      <Rect
        x="13.8"
        y="11.2"
        width="5.2"
        height="4"
        rx="2"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth={1.6}
      />
      <Circle
        cx="16.4"
        cy="13.2"
        r="0.8"
        fill={focused ? '#FFFFFF' : color}
      />
    </Svg>
  );
}
