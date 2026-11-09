import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export function Badge({
  label,
  color = '#F5ECE7',
  textColor = '#34312F',
  size = 'small',
  style,
}: BadgeProps) {
  const isSmall = size === 'small';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
          borderRadius: isSmall ? 10 : 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isSmall ? 11 : 13,
            fontWeight: isSmall ? '500' : '600',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: -0.1,
  },
});
