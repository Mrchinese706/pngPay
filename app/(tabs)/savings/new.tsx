import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { createSavingsGoal } from '@/services/goalService';
import { spacing, type } from '@/theme';
import { isValidDateInput, parsePositiveCurrencyAmount } from '@/utils';

export default function NewSavingsGoalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('personal');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const targetAmount = parsePositiveCurrencyAmount(target);
    if (!name.trim() || targetAmount === null) {
      setError('Enter a goal name and a positive target with up to two decimal places.');
      return;
    }
    if (!isValidDateInput(targetDate)) {
      setError('Enter a valid target date as YYYY-MM-DD, or leave it blank.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const goal = await createSavingsGoal({
        name: name.trim(),
        category,
        target_amount: targetAmount,
        target_date: targetDate,
      });
      router.replace({ pathname: '/(tabs)/savings/[id]', params: { id: goal.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create this goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Button label="← Bilum Seif" variant="ghost" fullWidth={false} onPress={() => router.back()} />
        <Text style={[type.h2, { color: theme.colors.textPrimary }]}>Create a savings goal</Text>
        <Text style={[type.bodySmall, { color: theme.colors.textSecondary }]}>
          A personal planning tool only. No money is held or transferred.
        </Text>
        <TextField label="Goal name" value={name} onChangeText={setName} maxLength={80} placeholder="e.g. University fees" />
        <TextField label="Target amount (PGK)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" />
        <TextField label="Target date (optional, YYYY-MM-DD)" value={targetDate} onChangeText={setTargetDate} placeholder="2027-01-31" />
        <Text style={[type.label, { color: theme.colors.textPrimary }]}>Category</Text>
        {(['personal', 'education', 'emergency'] as const).map((value) => (
          <Button
            key={value}
            label={`${category === value ? '● ' : '○ '}${value[0].toUpperCase()}${value.slice(1)}`}
            onPress={() => setCategory(value)}
            variant={category === value ? 'accent' : 'secondary'}
          />
        ))}
        {error ? <Text style={[type.bodySmall, { color: theme.colors.error }]} accessibilityRole="alert">{error}</Text> : null}
        <Button label="Create goal" onPress={submit} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
});
