import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export function MeditateTileIllustration({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Pink flower crown meditating figure */}
      <Circle cx="30" cy="18" r="14" fill="#F4A5AC" opacity={0.6} />
      {/* Petals */}
      <Circle cx="30" cy="8" r="5" fill="#E8828D" />
      <Circle cx="21" cy="12" r="5" fill="#E8828D" />
      <Circle cx="39" cy="12" r="5" fill="#E8828D" />
      <Circle cx="18" cy="20" r="5" fill="#E8828D" />
      <Circle cx="42" cy="20" r="5" fill="#E8828D" />
      {/* Face */}
      <Circle cx="30" cy="24" r="8" fill="#F9D7C9" />
      <Path d="M27 24c.8.8 1.8.8 2.5 0" stroke="#4A342B" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M30.5 24c.8.8 1.8.8 2.5 0" stroke="#4A342B" strokeWidth="1.2" strokeLinecap="round" />
      {/* Meditating body */}
      <Path d="M22 36c2-4 6-6 8-6s6 2 8 6" fill="#F8A77E" />
      {/* Blue/teal yoga pants */}
      <Path d="M18 48c4-6 10-4 12-2 2-2 8-4 12 2-2 4-10 6-12 4-2 2-10 0-12-4z" fill="#80B0C4" />
    </Svg>
  );
}

export function JournalTileIllustration({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Delicate botanical branches behind book */}
      <Path d="M30 18C28 10 24 5 18 4" stroke="#7A937D" strokeWidth="1.4" strokeLinecap="round" />
      <Circle cx="18" cy="4" r="2.5" fill="#E8828D" />
      <Path d="M34 16c4-7 10-12 16-11" stroke="#7A937D" strokeWidth="1.4" strokeLinecap="round" />
      <Circle cx="50" cy="5" r="2.5" fill="#F7CA44" />
      <Path d="M38 20c6-3 12-3 15 2" stroke="#7A937D" strokeWidth="1.4" strokeLinecap="round" />
      
      {/* Leather/terracotta Journal Notebook */}
      <Rect x="20" y="18" width="24" height="32" rx="3" fill="#A86B52" />
      {/* Spine & ribbon */}
      <Rect x="20" y="18" width="4" height="32" rx="1" fill="#8A533D" />
      <Path d="M32 18v20l3-3 3 3V18h-6z" fill="#FFF8F0" />
      
      {/* Pencil leaning against book */}
      <Path d="M14 48l5-24 4 1-5 24-4-1z" fill="#F7CA44" />
      <Path d="M14 48l-1 4 4-1-3-3z" fill="#3D352E" />
    </Svg>
  );
}

export function HaircareTileIllustration({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Girl with lush flowing hair */}
      <Circle cx="30" cy="22" r="16" fill="#8C5845" />
      {/* Hair waves */}
      <Path d="M14 26c-3 8 2 18 10 20 4-4 2-12 2-16-4-1-8-2-12-4z" fill="#8C5845" />
      <Path d="M46 26c3 8-2 18-10 20-4-4-2-12-2-16 4-1 8-2 12-4z" fill="#8C5845" />
      {/* Face */}
      <Circle cx="30" cy="24" r="8" fill="#F9D7C9" />
      <Path d="M26 23c.8.8 1.8.8 2.5 0" stroke="#4A342B" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M31.5 23c.8.8 1.8.8 2.5 0" stroke="#4A342B" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M28.5 28c1 .8 2 .8 3 0" stroke="#E87C86" strokeWidth="1.2" strokeLinecap="round" />
      {/* Little flower in hair */}
      <Circle cx="37" cy="18" r="3.5" fill="#E8828D" />
      <Circle cx="37" cy="18" r="1.5" fill="#FDE28A" />
      {/* Soft shoulders */}
      <Path d="M20 42c3-6 7-8 10-8s7 2 10 8" fill="#E9C5BE" />
    </Svg>
  );
}

export function SkincareTileIllustration({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Skincare dropper bottle & cream tub */}
      {/* Dropper bottle */}
      <Rect x="16" y="22" width="16" height="26" rx="4" fill="#E8B36F" opacity={0.85} />
      <Rect x="20" y="16" width="8" height="6" rx="1" fill="#FFF9F5" />
      <Rect x="22" y="10" width="4" height="6" rx="2" fill="#3D352E" />
      <Rect x="19" y="30" width="10" height="12" rx="1" fill="#FFF9F5" />
      
      {/* Cosmetic jar / cream */}
      <Rect x="32" y="32" width="20" height="16" rx="3" fill="#E9C5BE" />
      <Rect x="30" y="28" width="24" height="5" rx="2.5" fill="#FAF8F4" stroke="#EEEAE5" />
      
      {/* Gentle leaf accent */}
      <Path d="M34 18c3-5 8-8 14-6-1 6-4 10-9 11" stroke="#8DB580" strokeWidth="1.4" fill="#8DB580" opacity={0.4} />
    </Svg>
  );
}
