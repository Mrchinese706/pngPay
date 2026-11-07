import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BilumPattern } from '@/components/BilumPattern';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState, LoadingView } from '@/components/StateViews';
import { useTheme } from '@/context/ThemeContext';
import { usePools } from '@/hooks/useGoalData';
import { radius, shadows, spacing, type } from '@/theme';
import { formatCurrency } from '@/utils';

export default function GroupsScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { pools, loading, error, migrationRequired, refresh } = usePools();
  const router = useRouter();

  const summaries = useMemo(() => pools.map((pool) => ({
    ...pool,
    collected: pool.pool_contributions.reduce((sum, entry) => sum + Number(entry.amount), 0),
    contributorCount: new Set(pool.pool_contributions.map((entry) => entry.contributor_name)).size,
  })), [pools]);

  if (loading) return <LoadingView />;
  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.hero, { backgroundColor: colors.primary }]}>
            <BilumPattern width={400} height={160} opacity={0.1} />
            <View style={styles.heroContent}>
              <Text style={{ fontSize: 40 }} accessibilityLabel="Wantok Pool">🤝</Text>
              <View style={styles.heroText}>
                <Text style={[type.h2, { color: colors.textOnPrimary }]}>Wantok Pool</Text>
                <Text style={[type.bodySmall, { color: colors.balanceCardText }]}>
                  Your saved pools could not be loaded.
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.content}>
            <Card style={{ borderColor: colors.error, borderWidth: 1 }}>
              <Text style={[type.labelLarge, { color: colors.error }]}>Pools unavailable</Text>
              <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                {error}
              </Text>
              {migrationRequired ? (
                <Text style={[type.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                  Apply the PNGPay pools and savings migration, then try again.
                </Text>
              ) : null}
              <Button label="Retry loading pools" variant="secondary" onPress={() => { void refresh(); }} style={{ marginTop: spacing.md }} />
              <Button label="Create a pool" onPress={() => router.push('/(tabs)/groups/new')} style={{ marginTop: spacing.sm }} />
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <BilumPattern width={400} height={160} opacity={0.1} />
          <View style={styles.heroContent}>
            <Text style={{ fontSize: 40 }} accessibilityLabel="Wantok Pool">🤝</Text>
            <View style={styles.heroText}>
              <Text style={[type.h2, { color: colors.textOnPrimary }]}>Wantok Pool</Text>
              <Text style={[type.bodySmall, { color: colors.balanceCardText }]}>
                Track shared goals and simulated contributions.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[type.h4, { color: colors.textPrimary }]}>Your pools</Text>
              <Text style={[type.caption, { color: colors.textMuted, marginTop: spacing.xxs }]}>
                Private to your account · No real funds are moved
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/groups/new')}
              accessibilityRole="button"
              accessibilityLabel="Create a pool"
              style={[styles.addButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[type.label, { color: colors.textOnAccent }]}>＋ New</Text>
            </TouchableOpacity>
          </View>

          {summaries.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                message="Create a pool to organise a shared goal. Contributions are personal simulated records, not real payments."
                actionLabel="Create a pool"
                onAction={() => router.push('/(tabs)/groups/new')}
                illustration="🧺"
              />
            </Card>
          ) : summaries.map((pool) => {
            const progress = Math.min(pool.collected / Number(pool.target_amount), 1);
            return (
              <TouchableOpacity
                key={pool.id}
                onPress={() => router.push({ pathname: '/(tabs)/groups/[id]', params: { id: pool.id } })}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${pool.name}, ${Math.round(progress * 100)} percent of goal`}
              >
                <Card style={styles.poolCard}>
                  <View style={styles.poolHeader}>
                    <View style={[styles.poolIcon, { backgroundColor: colors.overlayLight }]}>
                      <Text style={{ fontSize: 24 }}>{pool.category === 'education' ? '🎓' : pool.category === 'family' ? '🏠' : '🧺'}</Text>
                    </View>
                    <View style={styles.poolTitle}>
                      <Text style={[type.labelLarge, { color: colors.textPrimary }]} numberOfLines={1}>
                        {pool.name}
                      </Text>
                      <Text style={[type.caption, { color: colors.textMuted }]} numberOfLines={2}>
                        {pool.purpose}
                      </Text>
                    </View>
                    <Text style={[type.label, { color: colors.accentText }]}>{Math.round(progress * 100)}%</Text>
                  </View>
                  <View
                    accessibilityRole="progressbar"
                    accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
                    style={[styles.progressTrack, { backgroundColor: colors.border }]}
                  >
                    <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
                  </View>
                  <View style={styles.poolFooter}>
                    <View>
                      <Text style={[type.label, { color: colors.textPrimary }]}>{formatCurrency(pool.collected)}</Text>
                      <Text style={[type.caption, { color: colors.textMuted }]}>of {formatCurrency(Number(pool.target_amount))}</Text>
                    </View>
                    <Text style={[type.caption, { color: colors.textMuted }]}>
                      {pool.contributorCount} recorded contributor{pool.contributorCount === 1 ? '' : 's'}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
          <Button
            label="Explore Bilum Seif savings"
            variant="secondary"
            onPress={() => router.push('/(tabs)/savings/index')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  hero: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, overflow: 'hidden' },
  heroContent: { flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  heroText: { flex: 1, marginLeft: spacing.md, gap: spacing.xs },
  content: { padding: spacing.md, gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  addButton: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  poolCard: { gap: spacing.md, ...shadows.sm },
  poolHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  poolIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  poolTitle: { flex: 1, gap: spacing.xxs },
  progressTrack: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full },
  poolFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
});
