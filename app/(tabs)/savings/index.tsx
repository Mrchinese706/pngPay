import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BilumPattern } from '@/components/BilumPattern';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState, ErrorState, LoadingView } from '@/components/StateViews';
import { useTheme } from '@/context/ThemeContext';
import { useSavingsGoals } from '@/hooks/useGoalData';
import { radius, spacing, type } from '@/theme';
import { formatCurrency } from '@/utils';

export default function SavingsScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { goals, loading, error, migrationRequired, refresh } = useSavingsGoals();
  const router = useRouter();

  if (loading) return <LoadingView />;
  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ErrorState
          message={migrationRequired
            ? `${error}\nApply the PNGPay pools and savings migration, then try again.`
            : error}
          onRetry={refresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <BilumPattern width={400} height={150} opacity={0.1} />
          <Text style={{ fontSize: 36 }}>🧺</Text>
          <Text style={[type.h2, { color: colors.textOnPrimary, marginTop: spacing.sm }]}>Bilum Seif</Text>
          <Text style={[type.bodySmall, { color: colors.balanceCardText, marginTop: spacing.xs }]}>
            Organise savings goals. These records do not move or hold money.
          </Text>
        </View>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={[type.h4, { color: colors.textPrimary }]}>Your goals</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/savings/new')}
              accessibilityRole="button"
              style={[styles.addButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[type.label, { color: colors.textOnAccent }]}>＋ New goal</Text>
            </TouchableOpacity>
          </View>
          {goals.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                message="Create a personal goal, then record simulated progress toward it."
                actionLabel="Create a savings goal"
                onAction={() => router.push('/(tabs)/savings/new')}
                illustration="🎯"
              />
            </Card>
          ) : goals.map((goal) => {
            const saved = goal.savings_contributions.reduce((sum, item) => sum + Number(item.amount), 0);
            const progress = Math.min(saved / Number(goal.target_amount), 1);
            return (
              <TouchableOpacity
                key={goal.id}
                onPress={() => router.push({ pathname: '/(tabs)/savings/[id]', params: { id: goal.id } })}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${goal.name}, ${Math.round(progress * 100)} percent saved`}
              >
                <Card style={styles.goalCard}>
                  <View style={styles.goalTitle}>
                    <View style={[styles.goalIcon, { backgroundColor: colors.highlight + '33' }]}>
                      <Text style={{ fontSize: 22 }}>{goal.category === 'education' ? '🎓' : goal.category === 'emergency' ? '🛟' : '🌱'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[type.labelLarge, { color: colors.textPrimary }]} numberOfLines={1}>{goal.name}</Text>
                      <Text style={[type.caption, { color: colors.textMuted }]}>
                        {goal.target_date ? `Target ${goal.target_date}` : 'No target date'}
                      </Text>
                    </View>
                  </View>
                  <View
                    accessibilityRole="progressbar"
                    accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
                    style={[styles.progressTrack, { backgroundColor: colors.border }]}
                  >
                    <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
                  </View>
                  <View style={styles.goalFooter}>
                    <Text style={[type.label, { color: colors.accentText }]}>{formatCurrency(saved)}</Text>
                    <Text style={[type.caption, { color: colors.textMuted }]}>of {formatCurrency(Number(goal.target_amount))}</Text>
                    <Text style={[type.caption, { color: colors.textMuted, marginLeft: 'auto' }]}>{Math.round(progress * 100)}%</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
          <Button label="Back to Wantok Pool" variant="secondary" onPress={() => router.push('/(tabs)/groups')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  hero: { padding: spacing.lg, overflow: 'hidden' },
  content: { padding: spacing.md, gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  addButton: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  goalCard: { gap: spacing.md },
  goalTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  goalIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full },
  goalFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
