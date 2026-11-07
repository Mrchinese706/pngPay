import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, type } from '../theme';
import { Button } from './Button';

// ─── Loading ─────────────────────────────────────────────────────────────────

export function LoadingView() {
  const { theme } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.loaderRing, { borderColor: theme.colors.accent }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
      <Text style={[type.bodySmall, { color: theme.colors.textMuted, marginTop: spacing.md }]}>
        Loading…
      </Text>
    </View>
  );
}

// ─── Skeleton Placeholder ─────────────────────────────────────────────────────

export function SkeletonLine({
  width = '100%',
  height = 16,
  borderRadius = 8,
}: {
  width?: ViewStyle['width'];
  height?: number;
  borderRadius?: number;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: theme.colors.skeleton,
        marginBottom: spacing.sm,
      }}
    />
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

type EmptyProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: string;
};

export function EmptyState({ message, actionLabel, onAction, illustration = '📭' }: EmptyProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.illustrationBg, { backgroundColor: theme.colors.overlayLight }]}>
        <Text style={styles.illustrationEmoji}>{illustration}</Text>
      </View>
      <Text style={[type.h3, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }]}>
        Nothing here yet
      </Text>
      <Text style={[type.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} />
      ) : null}
    </View>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────

type ErrorProps = { message: string; onRetry: () => void };

export function ErrorState({ message, onRetry }: ErrorProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.illustrationBg, { backgroundColor: theme.colors.errorLight }]}>
        <Text style={styles.illustrationEmoji}>⚠️</Text>
      </View>
      <Text style={[type.h3, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }]}>
        Something went wrong
      </Text>
      <Text style={[type.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg }]}>
        {message}
      </Text>
      <Button label="Try Again" onPress={onRetry} fullWidth={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loaderRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  illustrationEmoji: { fontSize: 40 },
});
