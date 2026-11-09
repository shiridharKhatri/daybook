import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface BotanicalHeaderProps {
  width?: number | string;
  height?: number;
}

export function BotanicalHeader({ width = '100%', height = 80 }: BotanicalHeaderProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 380 80" fill="none">
      {/* Very soft warm gradient background wash */}
      <Path
        d="M0 0h380v65c-60 12-140 15-200 8C100 65 40 58 0 68V0z"
        fill="#F6EFE6"
        opacity={0.65}
      />

      {/* Left delicate floral branch: faint soft line art */}
      <G stroke="#A39686" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity={0.35}>
        <Path d="M5 75C12 55 22 35 32 15" />
        <Path d="M32 15c-3-6-10-8-15-3-5 5-3 11 3 14 6 3 11-1 12-11z" fill="#FAF8F4" />
        <Path d="M32 15c2-5 9-6 13-1 4 4 2 11-3 13" fill="#FAF8F4" />
        <Path d="M15 45c-5-3-8-8-5-12 3-4 10-1 11 4" />
        <Path d="M22 55c6-2 11-6 9-11-2-5-8-5-11-1" />
      </G>

      {/* Right eucalyptus branch: faint soft line art */}
      <G stroke="#A39686" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity={0.35}>
        <Path d="M375 75C365 55 352 38 340 18" />
        <Path d="M340 18c4-6 11-6 16-1 5 5 2 12-4 14-6 2-12-3-12-13z" fill="#FAF8F4" />
        <Path d="M340 18c-3-6-10-5-14 0-4 5-2 11 4 13" fill="#FAF8F4" />
        <Path d="M360 45c5-3 8-8 5-12-3-4-10-1-11 4" />
        <Path d="M350 55c-6-2-11-6-9-11 2-5 8-5 11-1" />
      </G>
    </Svg>
  );
}
