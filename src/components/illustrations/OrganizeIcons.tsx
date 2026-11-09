import React from 'react';
import Svg, { Path, Rect, Circle, G, Line } from 'react-native-svg';

export function JournalTileIcon({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x="8" y="6" width="24" height="28" rx="4" fill="#C58882" opacity={0.15} />
      <Rect x="8" y="6" width="24" height="28" rx="4" stroke="#C58882" strokeWidth="2" />
      <Line x1="14" y1="13" x2="26" y2="13" stroke="#C58882" strokeWidth="2" strokeLinecap="round" />
      <Line x1="14" y1="19" x2="24" y2="19" stroke="#C58882" strokeWidth="2" strokeLinecap="round" />
      <Line x1="14" y1="25" x2="20" y2="25" stroke="#C58882" strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 10h5v20H8V10z" fill="#C58882" opacity={0.4} />
    </Svg>
  );
}

export function NotesTileIcon({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x="7" y="6" width="26" height="28" rx="4" fill="#E8B36F" opacity={0.15} />
      <Rect x="7" y="6" width="26" height="28" rx="4" stroke="#E8B36F" strokeWidth="2" />
      <Path d="M13 14h14M13 20h10M13 26h14" stroke="#E8B36F" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="27" cy="27" r="5" fill="#E8B36F" />
      <Path d="M26 27l1 1 2-2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HaircareTileIcon({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Circle cx="20" cy="20" r="16" fill="#8DB580" opacity={0.15} />
      <Circle cx="20" cy="20" r="16" stroke="#8DB580" strokeWidth="2" />
      {/* Botanical leaf / hair follicle droplet */}
      <Path
        d="M20 10c-4 5-8 10-8 14a8 8 0 0016 0c0-4-4-9-8-14z"
        fill="#8DB580"
        opacity={0.3}
      />
      <Path
        d="M20 10c-4 5-8 10-8 14a8 8 0 0016 0c0-4-4-9-8-14z"
        stroke="#8DB580"
        strokeWidth="2"
      />
      <Path d="M20 14v10M17 21l3 3 4-4" stroke="#8DB580" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function SkincareTileIcon({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x="12" y="14" width="16" height="20" rx="4" fill="#8BB0C4" opacity={0.15} />
      <Rect x="12" y="14" width="16" height="20" rx="4" stroke="#8BB0C4" strokeWidth="2" />
      {/* Dropper top */}
      <Rect x="16" y="9" width="8" height="5" rx="1.5" stroke="#8BB0C4" strokeWidth="1.5" fill="#FAF8F4" />
      <Path d="M19 6h2v3h-2V6z" fill="#8BB0C4" />
      {/* Serum level */}
      <Path d="M13 26c3 1 11-1 14 0v6a2 2 0 01-2 2H15a2 2 0 01-2-2v-6z" fill="#8BB0C4" opacity={0.4} />
    </Svg>
  );
}

export function ShoppingTileIcon({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x="9" y="13" width="22" height="21" rx="4" fill="#C58882" opacity={0.15} />
      <Rect x="9" y="13" width="22" height="21" rx="4" stroke="#C58882" strokeWidth="2" />
      {/* Bag handle */}
      <Path
        d="M15 13V10a5 5 0 0110 0v3"
        stroke="#C58882"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Heart tag */}
      <Circle cx="20" cy="23" r="4" fill="#C58882" />
    </Svg>
  );
}

export function TasksTileIcon({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x="8" y="7" width="24" height="26" rx="5" fill="#E8B36F" opacity={0.15} />
      <Rect x="8" y="7" width="24" height="26" rx="5" stroke="#E8B36F" strokeWidth="2" />
      <Circle cx="15" cy="15" r="2.5" fill="#E8B36F" />
      <Line x1="20" y1="15" x2="26" y2="15" stroke="#E8B36F" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="15" cy="22" r="2.5" fill="#E8B36F" />
      <Line x1="20" y1="22" x2="26" y2="22" stroke="#E8B36F" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

