import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptic } from '../../utils/haptics';
import { useAppStore } from '../../stores/appStore';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const setIsSheetOpen = useAppStore((s) => s.setIsSheetOpen);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      setIsSheetOpen(true);
    } else {
      setIsSheetOpen(false);
    }

    return () => {
      setIsSheetOpen(false);
    };
  }, [visible, setIsSheetOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          haptic.selection();
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            bounciness: 4,
            speed: 16,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Full-screen backdrop touch listener to dismiss modal when tapping outside */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close sheet"
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(24, insets.bottom + 12),
              transform: [{ translateY }],
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            {/* Top drag handle indicator (interactive drag target) */}
            <View
              style={styles.handleContainer}
              {...panResponder.panHandlers}
            >
              <View style={styles.handle} />
            </View>

            {title && (
              <View
                style={styles.header}
                {...panResponder.panHandlers}
              >
                <Text style={styles.title}>{title}</Text>
              </View>
            )}

            <View style={styles.content}>{children}</View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 33, 31, 0.42)', // Calm, gentle dimming backdrop that focuses on sheet and hides background noise
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#EFEAE4',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  keyboardAvoid: {
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#DCD4CB',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EC',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34312F',
    letterSpacing: -0.3,
  },
  content: {
    flexShrink: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
