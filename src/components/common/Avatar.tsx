import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle, StyleProp } from 'react-native';

interface AvatarProps {
  name?: string;
  uri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ name = 'User', uri, size = 40, style }: AvatarProps) {
  const initial = (name.trim()[0] || 'U').toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#F5ECE7',
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: Math.floor(size * 0.42),
            color: '#34312F',
          },
        ]}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#EEEAE5',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  text: {
    fontWeight: '700',
  },
});
