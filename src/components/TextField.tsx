import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, type } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export function TextField({
  label,
  error,
  hint,
  prefix,
  suffix,
  containerStyle,
  secureTextEntry,
  ...inputProps
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.accent
    : colors.border;

  const bgColor = focused ? colors.surface : colors.inputBackground;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[type.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputRow,
          {
            borderColor,
            backgroundColor: bgColor,
            borderWidth: focused ? 2 : 1.5,
          },
        ]}
      >
        {prefix ? (
          <Text style={[type.body, { color: colors.textMuted, marginRight: spacing.xs }]}>
            {prefix}
          </Text>
        ) : null}

        <TextInput
          style={[
            styles.input,
            type.body,
            { color: colors.textPrimary, flex: 1 },
          ]}
          accessibilityLabel={label}
          accessibilityHint={hint}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Text style={{ fontSize: 16 }}>{hidden ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        ) : suffix ? (
          <View style={styles.suffix}>{suffix}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={[type.caption, { color: colors.error, marginTop: spacing.xs }]}>
          ⚠ {error}
        </Text>
      ) : hint ? (
        <Text style={[type.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  input: {
    paddingVertical: spacing.sm,
  },
  toggle: { padding: spacing.xs },
  suffix: { marginLeft: spacing.xs },
});
