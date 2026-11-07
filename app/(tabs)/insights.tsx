import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { LoadingView } from '@/components/StateViews';
import { BilumPattern } from '@/components/BilumPattern';
import { useTransfers } from '@/hooks/useTransfers';
import { usePayees } from '@/hooks/usePayees';
import { useSavingsGoals } from '@/hooks/useGoalData';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, type } from '@/theme';
import { formatCurrency, formatDate } from '@/utils';

// ─── Simple Bar Chart ─────────────────────────────────────────────────────────

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const { theme } = useTheme();
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ emoji, label, value, sub, color }: {
  emoji: string; label: string; value: string; sub?: string; color: string;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[type.caption, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[type.h3, { color }]}>{value}</Text>
        {sub ? <Text style={[type.caption, { color: colors.textMuted }]}>{sub}</Text> : null}
      </View>
    </View>
  );
}

// ─── Insights Screen ──────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { transfers, loading: tLoading } = useTransfers();
  const { payees, loading: pLoading } = usePayees();
  const { goals, error: goalsError } = useSavingsGoals();
  const router = useRouter();

  if (tLoading || pLoading) return <LoadingView />;

  const totalSent = transfers.reduce((s, t) => s + t.amount, 0);
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const sentThisWeek = transfers
    .filter((transfer) => new Date(transfer.created_at).getTime() >= oneWeekAgo)
    .reduce((sum, transfer) => sum + transfer.amount, 0);
  const avgTransfer = transfers.length > 0 ? totalSent / transfers.length : 0;
  const maxTransfer = transfers.length > 0 ? Math.max(...transfers.map(t => t.amount)) : 0;
  const totalSaved = goals.reduce(
    (goalSum, goal) => goalSum + goal.savings_contributions.reduce((sum, item) => sum + Number(item.amount), 0),
    0,
  );
  const totalSavingsTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);

  // Top payees by total amount sent
  const payeeTotals: Record<string, { name: string; total: number }> = {};
  transfers.forEach(t => {
    const key = t.payee_id;
    if (!payeeTotals[key]) payeeTotals[key] = { name: t.payees?.name ?? 'Unknown', total: 0 };
    payeeTotals[key].total += t.amount;
  });
  const topPayees = Object.values(payeeTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxPayeeTotal = topPayees[0]?.total ?? 1;

  // Last 6 months buckets (simplified by index)
  const recentTransfers = transfers.slice(0, 6);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary, overflow: 'hidden' }]}>
          <BilumPattern width={400} height={140} opacity={0.09} />
          <View style={styles.heroContent}>
            <Text style={{ fontSize: 36 }}>📊</Text>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[type.h2, { color: colors.textOnPrimary }]}>Insights</Text>
              <Text style={[type.bodySmall, { color: colors.textOnPrimary + 'BB' }]}>
                Your financial activity
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Summary Stats */}
          <Text style={[type.h4, { color: colors.textPrimary }]}>Summary</Text>
          <View style={styles.statsGrid}>
            <StatCard
              emoji="💸" label="Total Sent" value={formatCurrency(totalSent)}
              sub={`${transfers.length} transfers`} color={colors.accent}
            />
            <StatCard
              emoji="🗓" label="Sent in the last 7 days" value={formatCurrency(sentThisWeek)}
              sub="recorded outgoing transfers" color={colors.error}
            />
            <StatCard
              emoji="📈" label="Average" value={formatCurrency(avgTransfer)}
              sub="per transfer" color={colors.highlight}
            />
            <StatCard
              emoji="🔝" label="Largest" value={formatCurrency(maxTransfer)}
              color={colors.primary}
            />
            <StatCard
              emoji="👥" label="Payees" value={`${payees.length}`}
              sub="saved contacts" color={colors.information}
            />
          </View>

          {/* Top Payees */}
          {topPayees.length > 0 && (
            <Card style={{ backgroundColor: colors.card }}>
              <Text style={[type.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Top Recipients
              </Text>
              {topPayees.map((p, i) => (
                <View key={p.name} style={styles.payeeBar}>
                  <View style={styles.payeeLabel}>
                    <View style={[styles.rankBadge, { backgroundColor: colors.accent + '20' }]}>
                      <Text style={[type.caption, { color: colors.accentText, fontWeight: '700' }]}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={[type.bodySmall, { color: colors.textPrimary, flex: 1 }]}>
                      {p.name}
                    </Text>
                    <Text style={[type.label, { color: colors.accentText }]}>
                      {formatCurrency(p.total)}
                    </Text>
                  </View>
                  <MiniBar value={p.total} max={maxPayeeTotal} color={colors.accent} />
                </View>
              ))}
            </Card>
          )}

          {/* Recent Activity */}
          {recentTransfers.length > 0 && (
            <Card style={{ backgroundColor: colors.card }}>
              <Text style={[type.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Recent transfers
              </Text>
              {recentTransfers.map((t) => (
                <View key={t.id} style={[styles.recentRow, { borderBottomColor: colors.divider }]}>
                  <View style={[styles.txDot, { backgroundColor: colors.accent + '20' }]}>
                    <Text style={{ fontSize: 14 }}>💸</Text>
                  </View>
                  <Text style={[type.bodySmall, { color: colors.textPrimary, flex: 1 }]}>
                    {t.payees?.name ?? 'Unknown'} · {formatDate(t.created_at)}
                  </Text>
                  <Text style={[type.label, { color: colors.error }]}>
                    -{formatCurrency(t.amount)}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          <Card>
            <View style={styles.savingsHeader}>
              <View style={[styles.rankBadge, { backgroundColor: colors.highlight + '33' }]}>
                <Text style={{ fontSize: 16 }}>🧺</Text>
              </View>
              <Text style={[type.h4, { color: colors.textPrimary, flex: 1 }]}>Bilum Seif progress</Text>
              <Text style={[type.label, { color: colors.accentText }]}>{goals.length} goals</Text>
            </View>
            {goalsError ? (
              <Text style={[type.caption, { color: colors.textMuted }]}>
                Savings information is unavailable. Apply the savings migration to see your goals here.
              </Text>
            ) : (
              <>
                <Text style={[type.h3, { color: colors.textPrimary }]}>
                  {formatCurrency(totalSaved)} <Text style={[type.bodySmall, { color: colors.textMuted }]}>of {formatCurrency(totalSavingsTarget)}</Text>
                </Text>
                <MiniBar value={totalSaved} max={totalSavingsTarget} color={colors.accent} />
              </>
            )}
            <View style={{ marginTop: spacing.sm }}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/savings/index')}
                accessibilityRole="link"
                accessibilityLabel="Open Bilum Seif savings goals"
              >
                <Text style={[type.label, { color: colors.accentText }]}>Open Bilum Seif →</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <View style={{ height: spacing.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {},
  hero: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  statsGrid: { gap: spacing.sm },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  payeeBar: { marginBottom: spacing.md, gap: spacing.xs },
  payeeLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTrack: { height: 6, borderRadius: radius.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.full },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  txDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});
