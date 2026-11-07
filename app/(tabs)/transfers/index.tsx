import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyState, ErrorState, LoadingView } from '@/components/StateViews';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useTransfers } from '@/hooks/useTransfers';
import { useTheme } from '@/context/ThemeContext';
import { radius, shadows, spacing, type } from '@/theme';
import { formatCurrency, formatDate } from '@/utils';
import type { Transfer } from '@/types';

function TransferRow({ item }: { item: Transfer }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/transfers/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={[styles.row, { backgroundColor: colors.card, ...shadows.sm }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
          <Text style={{ fontSize: 18, color: colors.accentText, fontWeight: '700' }}>
            {item.payees?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[type.labelLarge, { color: colors.textPrimary }]}>
            {item.payees?.name ?? 'Unknown payee'}
          </Text>
          <Text style={[type.caption, { color: colors.textMuted }]}>
            {formatDate(item.created_at)}
          </Text>
          {item.note ? (
            <Text style={[type.bodySmall, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.note}
            </Text>
          ) : null}
        </View>
        <View style={styles.amountCol}>
          <Text style={[type.labelLarge, { color: colors.error }]}>
            -{formatCurrency(item.amount)}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
            <Text style={[type.caption, { color: colors.success }]}>Sent</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TransfersScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { transfers, loading, error, isOffline, isStale, refresh } = useTransfers();
  const router = useRouter();

  if (loading) return <LoadingView />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {isOffline && <OfflineBanner stale={isStale} />}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[type.h2, { color: colors.textOnPrimary }]}>💸 Payments</Text>
        <Text style={[type.bodySmall, { color: colors.textOnPrimary + 'AA' }]}>
          {error
            ? 'Transaction records unavailable'
            : `${transfers.length} transaction${transfers.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      <FlatList
        data={transfers}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TransferRow item={item} />}
        contentContainerStyle={
          transfers.length === 0
            ? { flex: 1 }
            : { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }
        }
        onRefresh={refresh}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          error ? (
            <ErrorState
              message={error}
              onRetry={() => { void refresh(); }}
            />
          ) : (
            <EmptyState
              message="No transfers yet. Send money to a saved payee."
              actionLabel="Send Money"
              onAction={() => router.push('/(tabs)/transfers/new')}
              illustration="💸"
            />
          )
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent, ...shadows.lg }]}
        onPress={() => router.push('/(tabs)/transfers/new')}
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
  info: { flex: 1, gap: 2 },
  amountCol: { alignItems: 'flex-end', gap: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
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
