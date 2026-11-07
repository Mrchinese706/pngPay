import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useSavingsGoals } from '@/hooks/useGoalData';
import { addSavingsContribution } from '@/services/goalService';
import { formatCurrency, formatDate, parsePositiveCurrencyAmount } from '@/utils';
import { spacing, type } from '@/theme';

export default function SavingsGoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { goals, loading, error, refresh } = useSavingsGoals();
  const [amount, setAmount] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const goal = goals.find((item) => item.id === id);

  const contribute = useCallback(async () => {
    const value = parsePositiveCurrencyAmount(amount);
    if (value === null) {
      setActionError('Enter a positive amount with up to two decimal places.');
      return;
    }
    setActionError('');
    setSaving(true);
    try {
      await addSavingsContribution(id, value);
      setAmount('');
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not record this progress.');
    } finally {
      setSaving(false);
    }
  }, [amount, id, refresh]);

  if (loading && !goal) return <LoadingView />;
  if (error && !goal) return <ErrorState message={error} onRetry={() => { void refresh(); }} />;
  if (!goal) return null;

  const saved = goal.savings_contributions.reduce((sum, item) => sum + Number(item.amount), 0);
  const progress = Math.min(saved / Number(goal.target_amount), 1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Button label="← Bilum Seif" variant="ghost" fullWidth={false} onPress={() => router.back()} />
        <Text style={[type.h2, { color: theme.colors.textPrimary }]}>{goal.name}</Text>
        <Card>
          <Text style={[type.label, { color: theme.colors.textMuted }]}>Simulated progress</Text>
          <Text style={[type.amount, { color: theme.colors.accentText }]}>{formatCurrency(saved)}</Text>
          <Text style={[type.bodySmall, { color: theme.colors.textSecondary }]}>
            of {formatCurrency(Number(goal.target_amount))} · {Math.round(progress * 100)}%
          </Text>
          <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: theme.colors.accent }]} />
          </View>
          {goal.target_date ? (
            <Text style={[type.caption, { color: theme.colors.textMuted, marginTop: spacing.sm }]}>Target date: {goal.target_date}</Text>
          ) : null}
        </Card>
        <Text style={[type.h4, { color: theme.colors.textPrimary }]}>Record progress</Text>
        <Text style={[type.caption, { color: theme.colors.textMuted }]}>
          This creates an organisational record only; it does not deposit money.
        </Text>
        <TextField label="Amount (PGK)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        {actionError ? <Text style={[type.bodySmall, { color: theme.colors.error }]} accessibilityRole="alert">{actionError}</Text> : null}
        <Button label="Record savings progress" onPress={contribute} loading={saving} />
        <Text style={[type.h4, { color: theme.colors.textPrimary, marginTop: spacing.md }]}>Progress history</Text>
        {goal.savings_contributions.length === 0 ? (
          <Text style={[type.bodySmall, { color: theme.colors.textMuted }]}>No progress recorded yet.</Text>
        ) : [...goal.savings_contributions].reverse().map((entry) => (
          <View key={entry.id} style={[styles.historyRow, { borderBottomColor: theme.colors.divider }]}>
            <Text style={[type.caption, { color: theme.colors.textMuted }]}>{formatDate(entry.created_at)}</Text>
            <Text style={[type.label, { color: theme.colors.accentText }]}>{formatCurrency(Number(entry.amount))}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  track: { height: 8, borderRadius: 999, overflow: 'hidden', marginTop: spacing.md },
  fill: { height: '100%', borderRadius: 999 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
});
