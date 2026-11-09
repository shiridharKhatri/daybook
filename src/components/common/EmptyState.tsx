import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="small"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 14,
    opacity: 0.85,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34312F',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    color: '#88827E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 4,
  },
});
