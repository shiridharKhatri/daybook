import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { FloatingPillTabBar } from '../../components/navigation/FloatingPillTabBar';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <FloatingPillTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="library" options={{ title: 'Library' }} />
        <Tabs.Screen name="assistant" options={{ title: 'Assistant' }} />
        <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
        <Tabs.Screen name="finance" options={{ title: 'Finance' }} />
      </Tabs>
    </View>
  );
}
