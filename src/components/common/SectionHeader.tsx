import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34312F',
    letterSpacing: -0.3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C58882',
  },
});
