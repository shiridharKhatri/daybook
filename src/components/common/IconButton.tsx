import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  variant?: 'default' | 'filled' | 'outline';
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  size = 40,
  variant = 'default',
  style,
}: IconButtonProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: '#F5ECE7',
        };
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#EEEAE5',
        };
      default:
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        getVariantStyle(),
        {
          opacity: pressed ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
