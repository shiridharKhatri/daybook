import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  header?: React.ReactNode;
  padded?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export function ScreenContainer({
  children,
  scrollable = true,
  header,
  padded = true,
  style,
  contentContainerStyle,
}: ScreenContainerProps) {
  const content = (
    <View
      style={[
        styles.inner,
        padded && styles.padded,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, style]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {header}
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  keyboardAvoid: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});
