import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export type MoodType = 'very_happy' | 'happy' | 'neutral' | 'angry' | 'sad';

interface MoodFaceProps {
  mood: MoodType;
  size?: number;
  isSelected?: boolean;
}

export function MoodFace({ mood, size = 48, isSelected = false }: MoodFaceProps) {
  const scale = size / 48;

  switch (mood) {
    case 'very_happy':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Yellow bubble body with speech tail */}
          <Path
            d="M24 4C13.5 4 5 12.5 5 23c0 4.2 1.4 8.1 3.7 11.2L6 42l8.5-2.5C17.4 41 20.6 42 24 42c10.5 0 19-8.5 19-19S34.5 4 24 4z"
            fill="#FCE182"
          />
          {/* Eyes - happy curves */}
          <Path d="M15 22c1.2-2 3.8-2 5 0" stroke="#34312F" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M28 22c1.2-2 3.8-2 5 0" stroke="#34312F" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cheerful blush */}
          <Circle cx="13" cy="25" r="2.5" fill="#F4A261" opacity={0.6} />
          <Circle cx="35" cy="25" r="2.5" fill="#F4A261" opacity={0.6} />
          {/* Big happy smile */}
          <Path d="M19 26c1.5 3.5 8.5 3.5 10 0" stroke="#34312F" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );

    case 'happy':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Soft pink/rose bubble */}
          <Path
            d="M24 4C13.5 4 5 12.5 5 23c0 4.2 1.4 8.1 3.7 11.2L6 42l8.5-2.5C17.4 41 20.6 42 24 42c10.5 0 19-8.5 19-19S34.5 4 24 4z"
            fill="#F6B8BA"
          />
          {/* Heart/love or happy squint eyes */}
          <Path d="M16 22c1-1.5 3-1.5 4 0" stroke="#4A3430" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M28 22c1-1.5 3-1.5 4 0" stroke="#4A3430" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sweet blush */}
          <Circle cx="14" cy="25" r="2.5" fill="#E87A7D" opacity={0.5} />
          <Circle cx="34" cy="25" r="2.5" fill="#E87A7D" opacity={0.5} />
          {/* Gentle smile */}
          <Path d="M21 27c1.5 2 4.5 2 6 0" stroke="#4A3430" strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );

    case 'neutral':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Slate/charcoal calm bubble */}
          <Path
            d="M24 4C13.5 4 5 12.5 5 23c0 4.2 1.4 8.1 3.7 11.2L6 42l8.5-2.5C17.4 41 20.6 42 24 42c10.5 0 19-8.5 19-19S34.5 4 24 4z"
            fill="#808C93"
          />
          {/* Calm horizontal eyes */}
          <Rect x="15" y="21" width="6" height="2.5" rx="1.2" fill="#FFFFFF" />
          <Rect x="27" y="21" width="6" height="2.5" rx="1.2" fill="#FFFFFF" />
          {/* Calm straight line mouth */}
          <Path d="M20 28h8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );

    case 'angry':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Coral/salmon bubble */}
          <Path
            d="M24 4C13.5 4 5 12.5 5 23c0 4.2 1.4 8.1 3.7 11.2L6 42l8.5-2.5C17.4 41 20.6 42 24 42c10.5 0 19-8.5 19-19S34.5 4 24 4z"
            fill="#F78A82"
          />
          {/* Angled eyebrows & dots */}
          <Path d="M15 19l5 2" stroke="#4A2624" strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M33 19l-5 2" stroke="#4A2624" strokeWidth="2.2" strokeLinecap="round" />
          <Circle cx="18" cy="24" r="1.8" fill="#4A2624" />
          <Circle cx="30" cy="24" r="1.8" fill="#4A2624" />
          {/* Pout / frustrated curve */}
          <Path d="M20 29c1.5-1.5 6.5-1.5 8 0" stroke="#4A2624" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );

    case 'sad':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Soft lavender/periwinkle bubble */}
          <Path
            d="M24 4C13.5 4 5 12.5 5 23c0 4.2 1.4 8.1 3.7 11.2L6 42l8.5-2.5C17.4 41 20.6 42 24 42c10.5 0 19-8.5 19-19S34.5 4 24 4z"
            fill="#BCB0D0"
          />
          {/* Soft sad slanted eyes */}
          <Path d="M15 22c1.2-1.5 3.5-1.5 4.5 0" stroke="#3D354A" strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M28.5 22c1.2-1.5 3.5-1.5 4.5 0" stroke="#3D354A" strokeWidth="2.2" strokeLinecap="round" />
          {/* Little tear drop */}
          <Path d="M33 25c0 1.2-.8 2-1.5 2s-1.5-.8-1.5-2c0-.8 1.5-2.5 1.5-2.5s1.5 1.7 1.5 2.5z" fill="#6EA5D8" />
          {/* Down-curved gentle sad mouth */}
          <Path d="M20 30c1.5-2 6.5-2 8 0" stroke="#3D354A" strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );
  }
}
