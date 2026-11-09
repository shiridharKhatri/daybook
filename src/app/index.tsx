import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../stores/appStore';

export default function Index() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    // Small timeout to allow Zustand persisted state to rehydrate from AsyncStorage
    const timer = setTimeout(() => {
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#C58882" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
