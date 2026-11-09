import React, { Component, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  ColorValue,
  UIManager,
} from 'react-native';

export interface GlassViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  cornerRadius?: number;
  variant?: 'regular' | 'clear';
  tint?: ColorValue;
  interactive?: boolean;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error boundary to safely catch unexpected native render errors
class GlassErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Gracefully catch and fall back
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 1. Safe detection of expo-liquid-glass-view
let NativeLiquidGlassView: any = null;
let isLiquidGlassAvailable = false;

try {
  if (Platform.OS === 'ios') {
    const liquidMod = require('expo-liquid-glass-view');
    // supportsNativeGlass is true only when the native Swift module is linked into the iOS binary
    if (liquidMod?.supportsNativeGlass === true) {
      // Further verify that the native view manager is registered in UIManager
      // to prevent UnimplementedView errors in Expo Go or unlinked dev builds
      const hasViewManager =
        UIManager.hasViewManagerConfig?.('ViewManagerAdapter_ExpoLiquidGlass_LiquidGlassView_1') ||
        UIManager.getViewManagerConfig?.('ViewManagerAdapter_ExpoLiquidGlass_LiquidGlassView_1') ||
        UIManager.getViewManagerConfig?.('ExpoLiquidGlass_LiquidGlassView');

      if (hasViewManager) {
        NativeLiquidGlassView = liquidMod.LiquidGlassView;
        isLiquidGlassAvailable = true;
      }
    }
  }
} catch {
  NativeLiquidGlassView = null;
  isLiquidGlassAvailable = false;
}

// 2. Safe detection of BlurView from expo-blur (natively bundled in Expo Go and all iOS builds)
let BlurViewComponent: any = null;
try {
  const blurMod = require('expo-blur');
  if (blurMod?.BlurView) {
    BlurViewComponent = blurMod.BlurView;
  }
} catch {
  BlurViewComponent = null;
}

/**
 * Universal Glass View for Daybook.
 * 1. Uses native SwiftUI / Metal Apple Liquid Glass on iOS when compiled into the binary.
 * 2. Uses native Apple BlurView (expo-blur) in Expo Go, simulator, or standard clients.
 * 3. Falls back gracefully to high-quality frosted styling on Android and Web.
 */
export function GlassView({
  children,
  style,
  containerStyle,
  cornerRadius = 24,
  variant = 'regular',
  tint = 'rgba(255, 255, 255, 0.55)',
  interactive = false,
  pointerEvents,
}: GlassViewProps) {
  // Safe Fallback View (Android, Web, or when blur/native glass is unavailable)
  const fallbackView = (
    <View
      pointerEvents={pointerEvents}
      style={[
        styles.fallbackGlass,
        { borderRadius: cornerRadius },
        style,
        containerStyle,
      ]}
    >
      {children}
    </View>
  );

  // Path 1: Native Liquid Glass (when running custom native build with Metal module linked)
  if (isLiquidGlassAvailable && NativeLiquidGlassView) {
    return (
      <GlassErrorBoundary fallback={fallbackView}>
        <NativeLiquidGlassView
          variant={variant}
          cornerRadius={cornerRadius}
          tint={tint}
          interactive={interactive}
          style={style}
          containerStyle={containerStyle}
          pointerEvents={pointerEvents}
        >
          {children}
        </NativeLiquidGlassView>
      </GlassErrorBoundary>
    );
  }

  // Path 2: Native Apple BlurView (natively available in Expo Go & development clients on iOS)
  if (BlurViewComponent && Platform.OS === 'ios') {
    const flatStyle = StyleSheet.flatten(style) || {};
    const { backgroundColor: _bg, ...cleanStyle } = flatStyle;

    return (
      <View
        pointerEvents={pointerEvents}
        style={[
          styles.glassContainer,
          { borderRadius: cornerRadius },
          cleanStyle,
        ]}
      >
        <BlurViewComponent
          intensity={variant === 'clear' ? 45 : 70}
          tint={variant === 'clear' ? 'light' : 'systemUltraThinMaterialLight'}
          style={StyleSheet.absoluteFill}
        />
        {/* Soft translucent tint overlay */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: tint,
              borderRadius: cornerRadius,
            },
          ]}
        />
        {children}
      </View>
    );
  }

  // Path 3: Frosted glass styling fallback
  return fallbackView;
}

const styles = StyleSheet.create({
  glassContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  fallbackGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default GlassView;
