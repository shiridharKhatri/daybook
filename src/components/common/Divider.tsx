import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#EEEAE5',
    marginVertical: 14,
    width: '100%',
  },
});
