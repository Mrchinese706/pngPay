import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useRecentWalletTransactions } from '@/hooks/useRecentWalletTransactions';
import { usePayees } from '@/hooks/usePayees';
import { useWeather } from '@/hooks/useWeather';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Button } from '@/components/Button';
import { BilumPattern } from '@/components/BilumPattern';
import { radius, shadows, spacing, type } from '@/theme';
import { formatCurrency, formatDate } from '@/utils';
import { describeWeatherCode } from '@/services/weatherService';
import type { WalletTransaction } from '@/types';

// ─── Balance Card ─────────────────────────────────────────────────────────────

function BalanceCard({
  balance,
  loading,
  payeeCount,
  onAddFunds,
}: {
  balance: number | null;
  loading: boolean;
  payeeCount: number | null;
  onAddFunds: () => void;
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const firstName = user?.email?.split('@')[0] ?? 'there';

  return (
    <View
      style={[
        styles.balanceCard,
        { backgroundColor: theme.colors.balanceCardBg, ...shadows.lg },
      ]}
    >
      <BilumPattern width={360} height={180} opacity={0.09} />

      {/* Header row */}
      <View style={styles.balanceHeader}>
        <View>
          <Text style={[type.label, { color: theme.colors.balanceCardText }]}>
            Good day,
          </Text>
          <Text style={[type.h3, { color: theme.colors.textOnPrimary, marginTop: 2 }]}>
            {firstName} 👋
          </Text>
        </View>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: theme.colors.accent + '30', borderColor: theme.colors.accent + '55' },
          ]}
        >
          <Text style={{ fontSize: 22 }}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.balanceBody}>
        <Text style={[type.label, { color: theme.colors.balanceCardText, marginBottom: spacing.xs }]}>
          Wallet Balance (Simulated)
        </Text>
        <View style={styles.amountRow}>
          <Text style={[type.amountLarge, { color: theme.colors.balanceAmountText, flex: 1 }]}>
            {hidden ? '••••••' : balance === null ? (loading ? 'Loading…' : 'Unavailable') : formatCurrency(balance)}
          </Text>
          <TouchableOpacity
            onPress={() => setHidden(h => !h)}
            style={styles.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show wallet balance' : 'Hide wallet balance'}
            accessibilityState={{ selected: hidden }}
          >
            <Text style={{ fontSize: 20 }}>{hidden ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[type.bodySmall, { color: theme.colors.balanceCardText, marginTop: spacing.xs }]}>
          {payeeCount === null
            ? 'Payee count unavailable · Simulated wallet'
            : `${payeeCount} saved payee${payeeCount !== 1 ? 's' : ''} · Simulated wallet`}
        </Text>
        <TouchableOpacity
          onPress={onAddFunds}
          activeOpacity={0.75}
          disabled={balance === null}
          style={[styles.addFundsButton, { borderColor: theme.colors.accent, opacity: balance === null ? 0.5 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Add simulated funds to wallet"
        >
          <Text style={[type.label, { color: theme.colors.textOnPrimary }]}>＋ Add simulated funds</Text>
        </TouchableOpacity>
      </View>

      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: theme.colors.accent }]} />
    </View>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

type QuickAction = { emoji: string; label: string; onPress: () => void; color: string };

function QuickActions() {
  const { theme } = useTheme();
  const router = useRouter();
  const actions: QuickAction[] = [
    {
      emoji: '💸',
      label: 'Send',
      onPress: () => router.push('/(tabs)/transfers/new'),
      color: theme.colors.accent,
    },
    {
      emoji: '👥',
      label: 'Payees',
      onPress: () => router.push('/(tabs)/payees'),
      color: theme.colors.highlight,
    },
    {
      emoji: '🤝',
      label: 'Wantok Pool',
      onPress: () => router.push('/(tabs)/groups'),
      color: theme.colors.highlight,
    },
    {
      emoji: '🧺',
      label: 'Bilum Seif',
      onPress: () => router.push('/(tabs)/savings/index'),
      color: theme.colors.highlight,
    },
  ];

  return (
    <View style={styles.actionsRow}>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.label}
          style={[
            styles.actionBtn,
            {
              backgroundColor: theme.colors.card,
              ...shadows.sm,
            },
          ]}
          onPress={a.onPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={a.label}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: a.color + '20' },
            ]}
          >
            <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
          </View>
          <Text style={[type.label, { color: theme.colors.textPrimary, marginTop: 6 }]}>
            {a.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Weather Card ─────────────────────────────────────────────────────────────

function WeatherCard() {
  const { theme } = useTheme();
  const { data, loading, error, permissionDenied, fetchWeather } = useWeather();

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  const cardStyle = { backgroundColor: theme.colors.card };

  if (loading) return (
    <Card style={cardStyle}>
      <Text style={[type.bodySmall, { color: theme.colors.textMuted }]}>Loading weather…</Text>
    </Card>
  );

  if (permissionDenied || error || !data) return (
    <Card style={cardStyle}>
      <TouchableOpacity onPress={fetchWeather} style={styles.weatherRetry}>
        <Text style={{ fontSize: 20 }}>⛅</Text>
        <Text style={[type.bodySmall, { color: theme.colors.textMuted, marginLeft: spacing.sm }]}>
          {permissionDenied ? 'Enable location for weather' : 'Tap to load weather'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <Card style={cardStyle}>
      <View style={styles.weatherRow}>
        <View>
          <Text style={[type.label, { color: theme.colors.textSecondary }]}>🌤 Local Weather</Text>
          <Text style={[type.h2, { color: theme.colors.textPrimary, marginTop: 2 }]}>
            {data.temperature}°C
          </Text>
          <Text style={[type.bodySmall, { color: theme.colors.textMuted }]}>
            {describeWeatherCode(data.weatherCode)} · {data.windspeed} km/h
          </Text>
        </View>
        <Text style={{ fontSize: 40 }}>🇵🇬</Text>
      </View>
    </Card>
  );
}

// ─── Transfer Row ─────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: WalletTransaction }) {
  const { theme } = useTheme();
  const router = useRouter();
  const isCredit = item.entry_type === 'credit';
  return (
    <TouchableOpacity
      onPress={() => {
        if (item.transfer_id) router.push(`/(tabs)/transfers/${item.transfer_id}`);
      }}
      disabled={!item.transfer_id}
      activeOpacity={0.8}
    >
      <View style={[styles.txRow, { backgroundColor: theme.colors.card, ...shadows.sm }]}>
        <View style={[styles.txAvatar, { backgroundColor: isCredit ? theme.colors.successLight : theme.colors.accent + '20' }]}>
          <Text style={{ fontSize: 18 }}>
            {isCredit ? '＋' : '↗'}
          </Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={[type.labelLarge, { color: theme.colors.textPrimary }]}>
            {item.description}
          </Text>
          <Text style={[type.caption, { color: theme.colors.textMuted }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View style={styles.txRight}>
          <Text style={[type.labelLarge, { color: isCredit ? theme.colors.success : theme.colors.error }]}>
            {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <View style={[styles.txBadge, { backgroundColor: theme.colors.successLight }]}>
            <Text style={[type.caption, { color: isCredit ? theme.colors.success : theme.colors.error }]}>
              {isCredit ? 'Added' : 'Sent'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { balance, loading: walletLoading, error: walletError, refresh: walletRefresh } = useWallet();
  const {
    transactions: recentActivity,
    loading: activityLoading,
    error: activityError,
    refresh: activityRefresh,
  } = useRecentWalletTransactions();
  const {
    payees,
    loading: pLoading,
    error: pError,
    refresh: pRefresh,
    isOffline: pOffline,
    isStale: pStale,
  } = usePayees();
  const router = useRouter();

  const isOffline = pOffline;
  const isStale = pStale;
  const payeeCount = pLoading || pError ? null : payees.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {isOffline && <OfflineBanner stale={isStale} />}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {walletError || pError ? (
          <Card style={{ borderColor: colors.error, borderWidth: 1 }}>
            <Text style={[type.labelLarge, { color: colors.error }]}>
              Some account data could not be loaded
            </Text>
            {walletError ? (
              <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                Wallet: {walletError}
              </Text>
            ) : null}
            {pError ? (
              <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                Payees: {pError}
              </Text>
            ) : null}
            <Button
              label="Retry loading"
              variant="secondary"
              onPress={() => { void walletRefresh(); void pRefresh(); }}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ) : null}

        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          loading={walletLoading}
          payeeCount={payeeCount}
          onAddFunds={() => router.push('/(tabs)/top-up')}
        />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[type.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
            Quick Actions
          </Text>
          <QuickActions />
        </View>

        {/* Weather */}
        <WeatherCard />

        {/* Recent Transfers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[type.h4, { color: colors.textPrimary }]}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/transfers')}
              accessibilityRole="button"
              accessibilityLabel="See all transfers"
            >
              <Text style={[type.label, { color: colors.accentText }]}>See all →</Text>
            </TouchableOpacity>
          </View>

          {activityError ? (
            <Card>
              <TouchableOpacity onPress={activityRefresh} accessibilityRole="button">
                <Text style={[type.bodySmall, { color: colors.textMuted }]}>
                  Could not load recent transfers. Tap to retry.
                </Text>
              </TouchableOpacity>
            </Card>
          ) : activityLoading ? (
            <Card>
              <Text style={[type.bodySmall, { color: colors.textMuted }]}>Loading wallet activity…</Text>
            </Card>
          ) : recentActivity.length === 0 ? (
            <Card style={{ backgroundColor: colors.card }}>
              <View style={styles.emptyActivity}>
                <Text style={{ fontSize: 32 }}>💸</Text>
                <Text style={[type.body, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
                  No wallet activity yet.{'\n'}Add simulated funds or send money to get started.
                </Text>
              </View>
            </Card>
          ) : (
            <View style={styles.txList}>
              {recentActivity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.warningLight, borderColor: colors.warning, borderWidth: 1 }]}>
          <Text style={[type.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
            ⚠️ PNGPay is a simulated university project wallet. No real money is transferred.
          </Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, gap: spacing.md },

  // Balance card
  balanceCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 180,
    padding: spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceBody: { flex: 1 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { padding: spacing.xs },
  addFundsButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  accentBar: {
    height: 3,
    width: 48,
    borderRadius: 2,
    marginTop: spacing.md,
  },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Weather
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherRetry: { flexDirection: 'row', alignItems: 'center' },

  // Sections
  section: { gap: spacing.xs },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  // Transactions
  txList: { gap: spacing.sm },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  txAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },

  emptyActivity: { alignItems: 'center', paddingVertical: spacing.lg },
  disclaimer: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
});
