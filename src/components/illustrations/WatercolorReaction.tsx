import React from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import { haptic } from '../../utils/haptics';

export type ReactionKey =
  | 'joyful_peach'
  | 'crying_cloud'
  | 'playful_wink'
  | 'sad_yellow'
  | 'dizzy_spiral'
  | 'sweet_smile'
  | 'peaceful_sad'
  | 'shocked_open'
  | 'laughing_happy'
  | 'sleepy_zz'
  | 'sick_mask'
  | 'pout_soft'
  | 'sobbing_tears'
  | 'nervous_teeth'
  | 'angry_grump'
  | 'kiss_love'
  | 'cute_kitty'
  | 'yawning_tired'
  | 'wink_blush'
  | 'exhausted_dead';

export const REACTION_SOURCES: Record<ReactionKey, any> = {
  joyful_peach: require('../../../assets/emoticons/joyful_peach.png'),
  crying_cloud: require('../../../assets/emoticons/crying_cloud.png'),
  playful_wink: require('../../../assets/emoticons/playful_wink.png'),
  sad_yellow: require('../../../assets/emoticons/sad_yellow.png'),
  dizzy_spiral: require('../../../assets/emoticons/dizzy_spiral.png'),
  sweet_smile: require('../../../assets/emoticons/sweet_smile.png'),
  peaceful_sad: require('../../../assets/emoticons/peaceful_sad.png'),
  shocked_open: require('../../../assets/emoticons/shocked_open.png'),
  laughing_happy: require('../../../assets/emoticons/laughing_happy.png'),
  sleepy_zz: require('../../../assets/emoticons/sleepy_zz.png'),
  sick_mask: require('../../../assets/emoticons/sick_mask.png'),
  pout_soft: require('../../../assets/emoticons/pout_soft.png'),
  sobbing_tears: require('../../../assets/emoticons/sobbing_tears.png'),
  nervous_teeth: require('../../../assets/emoticons/nervous_teeth.png'),
  angry_grump: require('../../../assets/emoticons/angry_grump.png'),
  kiss_love: require('../../../assets/emoticons/kiss_love.png'),
  cute_kitty: require('../../../assets/emoticons/cute_kitty.png'),
  yawning_tired: require('../../../assets/emoticons/yawning_tired.png'),
  wink_blush: require('../../../assets/emoticons/wink_blush.png'),
  exhausted_dead: require('../../../assets/emoticons/exhausted_dead.png'),
};

// Five primary mood categories from the prompt & reference
export const MOOD_TO_REACTION: Record<string, { key: ReactionKey; label: string; color: string }> = {
  very_happy: { key: 'joyful_peach', label: 'Very Happy', color: '#FCE182' },
  happy: { key: 'sweet_smile', label: 'Happy', color: '#F6B8BA' },
  neutral: { key: 'sleepy_zz', label: 'Neutral', color: '#808C93' },
  angry: { key: 'angry_grump', label: 'Angry', color: '#F78A82' },
  sad: { key: 'sobbing_tears', label: 'Sad', color: '#BCB0D0' },
};

interface WatercolorReactionProps {
  name: ReactionKey | 'very_happy' | 'happy' | 'neutral' | 'angry' | 'sad';
  size?: number;
  isSelected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export function WatercolorReaction({
  name,
  size = 46,
  isSelected = false,
  onPress,
  style,
  imageStyle,
}: WatercolorReactionProps) {
  // Resolve key if it's one of the 5 standard mood names
  const resolvedKey: ReactionKey =
    name in MOOD_TO_REACTION ? MOOD_TO_REACTION[name].key : (name as ReactionKey);

  const source = REACTION_SOURCES[resolvedKey] || REACTION_SOURCES.joyful_peach;

  const content = (
    <View
      style={[
        styles.wrapper,
        {
          width: size + 8,
          height: size + 8,
          borderRadius: (size + 8) / 2,
        },
        isSelected && styles.selectedWrapper,
        style,
      ]}
    >
      <Image
        source={source}
        style={[
          {
            width: size,
            height: size,
          },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          haptic.medium();
          onPress();
        }}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.92 : isSelected ? 1.08 : 1 }],
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C58882',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
