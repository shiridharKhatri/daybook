import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  multiline,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          isFocused && styles.focusedWrapper,
          !!error && styles.errorWrapper,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor="#B5AFA8"
          multiline={multiline}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#88827E',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EEEAE5',
    minHeight: 50,
    paddingHorizontal: 16,
  },
  multilineWrapper: {
    minHeight: 110,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  focusedWrapper: {
    borderColor: '#C58882',
  },
  errorWrapper: {
    borderColor: '#D4736C',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#34312F',
    paddingVertical: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: '100%',
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#D4736C',
    marginTop: 4,
    marginLeft: 4,
  },
});
