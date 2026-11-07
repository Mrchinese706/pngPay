import React from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows, spacing } from '../theme';

export type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined' | 'filled';

type Props = ViewProps & {
  variant?: CardVariant;
  padding?: keyof typeof spacing | number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function Card({
  variant = 'default',
  padding = 'md',
  style,
  children,
  ...props
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;

  const paddingValue = typeof padding === 'number' ? padding : spacing[padding];

  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.card,
      ...shadows.md,
    },
    elevated: {
      backgroundColor: colors.surfaceElevated,
      ...shadows.lg,
    },
    flat: {
      backgroundColor: colors.card,
      ...shadows.none,
    },
    outlined: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      ...shadows.none,
    },
    filled: {
      backgroundColor: colors.backgroundAlt,
      ...shadows.none,
    },
  };

  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        { padding: paddingValue },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
  },
});
