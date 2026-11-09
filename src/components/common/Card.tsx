import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { haptic } from '../../utils/haptics';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  noPadding?: boolean;
}

export function Card({ children, style, onPress, noPadding }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          haptic.light();
          onPress();
        }}
        style={({ pressed }) => [
          styles.card,
          noPadding && styles.noPadding,
          style,
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, noPadding && styles.noPadding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  noPadding: {
    padding: 0,
  },
});
