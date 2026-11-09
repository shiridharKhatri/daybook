import React from 'react';
import { Image, ImageStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export function MascotBadge({ size = 38 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Orange circle mascot with gentle crescent shadow */}
      <Circle cx="20" cy="20" r="18" fill="#F4976C" />
      <Path
        d="M20 2C30 2 38 10 38 20s-8 18-18 18c4-4 6-11 6-18s-2-14-6-18z"
        fill="#E87A4D"
        opacity={0.4}
      />
      {/* Eyes */}
      <Circle cx="15" cy="18" r="2" fill="#2E2420" />
      <Circle cx="25" cy="18" r="2" fill="#2E2420" />
      {/* Cheerful curve smile */}
      <Path
        d="M16 23c2 3.5 6 3.5 8 0"
        stroke="#2E2420"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Subtle blush */}
      <Circle cx="12" cy="22" r="1.5" fill="#E85D36" opacity={0.6} />
      <Circle cx="28" cy="22" r="1.5" fill="#E85D36" opacity={0.6} />
    </Svg>
  );
}

export function MindfulCharacter({
  width = 280,
  height = 280,
  style,
}: {
  width?: number;
  height?: number;
  style?: ImageStyle;
}) {
  return (
    <Image
      source={require('../../../assets/images/meditation.png')}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
}
