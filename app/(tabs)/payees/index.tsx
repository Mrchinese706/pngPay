import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyState, ErrorState, LoadingView } from '@/components/StateViews';
import { OfflineBanner } from '@/components/OfflineBanner';
import { usePayees } from '@/hooks/usePayees';
import { useTheme } from '@/context/ThemeContext';
import { radius, shadows, spacing, type } from '@/theme';
import type { Payee } from '@/types';

function PayeeRow({ item }: { item: Payee }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const initials = item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/payees/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={[styles.row, { backgroundColor: colors.card, ...shadows.sm }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[type.labelLarge, { color: colors.primary }]}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[type.labelLarge, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[type.caption, { color: colors.textMuted }]}>{item.account_ref}</Text>
        </View>
        <Text style={[type.h3, { color: colors.textMuted }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PayeesScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { payees, loading, error, isOffline, isStale, refresh } = usePayees();
  const router = useRouter();

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {isOffline && <OfflineBanner stale={isStale} />}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[type.h2, { color: colors.textOnPrimary }]}>👥 Payees</Text>
        <Text style={[type.bodySmall, { color: colors.textOnPrimary + 'AA' }]}>
          {payees.length} saved payee{payees.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={payees}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PayeeRow item={item} />}
        contentContainerStyle={
          payees.length === 0
            ? { flex: 1 }
            : { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }
        }
        onRefresh={refresh}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            message="No payees yet. Add someone to send money to."
            actionLabel="Add Payee"
            onAction={() => router.push('/(tabs)/payees/new')}
            illustration="👥"
          />
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent, ...shadows.lg }]}
        onPress={() => router.push('/(tabs)/payees/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
