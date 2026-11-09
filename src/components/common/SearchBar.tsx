import React from 'react';
import { View, TextInput, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { SearchIcon, CloseIcon } from '../icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search notes, products, tasks...',
  onClear,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <SearchIcon size={18} color="#88827E" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B5AFA8"
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={8}
          style={styles.clearButton}
        >
          <CloseIcon size={16} color="#88827E" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    height: 46,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#34312F',
    marginLeft: 10,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
});
