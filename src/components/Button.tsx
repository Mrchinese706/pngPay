import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, type } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDisabled = disabled || loading;

  const bgColors: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.surface,
    accent: colors.accent,
    danger: colors.danger,
    ghost: 'transparent',
    outline: 'transparent',
  };

  const borderColors: Record<ButtonVariant, string> = {
    primary: 'transparent',
    secondary: colors.border,
    accent: 'transparent',
    danger: 'transparent',
    ghost: 'transparent',
    outline: colors.primary,
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: colors.textOnPrimary,
    secondary: colors.textPrimary,
    accent: colors.textOnAccent,
    danger: '#FFFFFF',
    ghost: colors.primary,
    outline: colors.primary,
  };

  const heights: Record<ButtonSize, number> = { sm: 38, md: 50, lg: 58 };
  const textStyles = size === 'sm' ? type.label : size === 'lg' ? type.bodyLarge : type.labelLarge;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: bgColors[variant],
          borderColor: borderColors[variant],
          borderWidth: variant === 'secondary' || variant === 'outline' ? 1.5 : 0,
          height: heights[size],
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'outline' || variant === 'ghost'
            ? colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              textStyles,
              { color: textColors[variant], fontWeight: '600' },
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: { marginRight: spacing.xs },
  iconRight: { marginLeft: spacing.xs },
});
