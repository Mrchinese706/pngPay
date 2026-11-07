import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, type } from '../theme';

type Props = { stale?: boolean };

export function OfflineBanner({ stale = false }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: theme.colors.warning }]}>
      <Text style={[type.label, { color: theme.colors.primary, textAlign: 'center' }]}>
        📶{' '}
        {stale
          ? 'Offline — showing data from your last sync. It may be outdated.'
          : 'Offline — showing saved data.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
