import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';

import { haptic } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: '#C58882',
            borderColor: '#C58882',
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: '#F5ECE7',
            borderColor: '#F5ECE7',
          },
          text: {
            color: '#34312F',
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: '#EEEAE5',
            borderWidth: 1.5,
          },
          text: {
            color: '#34312F',
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          text: {
            color: '#88827E',
          },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: { height: 38, paddingHorizontal: 14, borderRadius: 19 },
          text: { fontSize: 13, fontWeight: '600' },
        };
      case 'medium':
        return {
          container: { height: 48, paddingHorizontal: 20, borderRadius: 24 },
          text: { fontSize: 15, fontWeight: '600' },
        };
      case 'large':
        return {
          container: { height: 56, paddingHorizontal: 28, borderRadius: 28 },
          text: { fontSize: 17, fontWeight: '600' },
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        {
          opacity: pressed && !disabled && !loading ? 0.9 : 1,
          transform: [{ scale: pressed && !disabled && !loading ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#34312F'}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.textBase,
              variantStyle.text,
              sizeStyle.text,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  textBase: {
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
