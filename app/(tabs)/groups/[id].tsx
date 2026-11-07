import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { addPoolContribution, fetchPoolById, type Pool } from '@/services/goalService';
import { formatCurrency, formatDate, parsePositiveCurrencyAmount } from '@/utils';
import { spacing, type } from '@/theme';

export default function PoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [pool, setPool] = useState<Pool | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPool(await fetchPoolById(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this pool.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const contribute = async () => {
    const value = parsePositiveCurrencyAmount(amount);
    if (value === null) {
      setError('Enter a positive amount with up to two decimal places.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addPoolContribution(id, value, user?.email?.split('@')[0] || 'Me');
      setAmount('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record this contribution.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error && !pool) return <ErrorState message={error} onRetry={() => { void load(); }} />;
  if (!pool) return null;

  const total = pool.pool_contributions.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const progress = Math.min(total / Number(pool.target_amount), 1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Button label="← Wantok Pool" variant="ghost" fullWidth={false} onPress={() => router.back()} />
        <Text style={[type.h2, { color: theme.colors.textPrimary }]}>{pool.name}</Text>
        <Text style={[type.body, { color: theme.colors.textSecondary }]}>{pool.purpose}</Text>
        <Card>
          <Text style={[type.label, { color: theme.colors.textMuted }]}>Recorded total</Text>
          <Text style={[type.amount, { color: theme.colors.accentText }]}>{formatCurrency(total)}</Text>
          <Text style={[type.bodySmall, { color: theme.colors.textSecondary }]}>
            of {formatCurrency(Number(pool.target_amount))} · {Math.round(progress * 100)}%
          </Text>
          {pool.deadline ? (
            <Text style={[type.caption, { color: theme.colors.textMuted, marginTop: spacing.sm }]}>Target date: {pool.deadline}</Text>
          ) : null}
        </Card>
        <Text style={[type.h4, { color: theme.colors.textPrimary }]}>Record a contribution</Text>
        <Text style={[type.caption, { color: theme.colors.textMuted }]}>
          This only records a simulated contribution under your account.
        </Text>
        <TextField label="Amount (PGK)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        {error ? <Text style={[type.bodySmall, { color: theme.colors.error }]} accessibilityRole="alert">{error}</Text> : null}
        <Button label="Record contribution" onPress={contribute} loading={saving} />
        <Text style={[type.h4, { color: theme.colors.textPrimary, marginTop: spacing.md }]}>Contribution history</Text>
        {pool.pool_contributions.length === 0 ? (
          <Text style={[type.bodySmall, { color: theme.colors.textMuted }]}>No contributions recorded yet.</Text>
        ) : [...pool.pool_contributions].reverse().map((entry) => (
          <View key={entry.id} style={[styles.historyRow, { borderBottomColor: theme.colors.divider }]}>
            <View>
              <Text style={[type.label, { color: theme.colors.textPrimary }]}>{entry.contributor_name}</Text>
              <Text style={[type.caption, { color: theme.colors.textMuted }]}>{formatDate(entry.created_at)}</Text>
            </View>
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
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
});
