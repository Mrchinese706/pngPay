import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { createPool } from '@/services/goalService';
import { spacing, type } from '@/theme';
import { isValidDateInput, parsePositiveCurrencyAmount } from '@/utils';

export default function NewPoolScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('community');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const targetAmount = parsePositiveCurrencyAmount(target);
    if (!name.trim() || !purpose.trim() || targetAmount === null) {
      setError('Enter a pool name, purpose, and a positive amount with up to two decimal places.');
      return;
    }
    if (!isValidDateInput(deadline)) {
      setError('Enter a valid target date as YYYY-MM-DD, or leave it blank.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const pool = await createPool({ name: name.trim(), purpose: purpose.trim(), target_amount: targetAmount, deadline, category });
      router.replace({ pathname: '/(tabs)/groups/[id]', params: { id: pool.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create this pool.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Button label="← Wantok Pool" variant="ghost" fullWidth={false} onPress={() => router.back()} />
        <Text style={[type.h2, { color: theme.colors.textPrimary }]}>Start a pool</Text>
        <Text style={[type.bodySmall, { color: theme.colors.textSecondary }]}>
          This creates a private simulated record. It does not collect or transfer money.
        </Text>
        <TextField label="Pool name" value={name} onChangeText={setName} maxLength={80} />
        <TextField label="Purpose" value={purpose} onChangeText={setPurpose} maxLength={160} />
        <TextField label="Target amount (PGK)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" />
        <TextField label="Target date (optional, YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} placeholder="2027-01-31" />
        <Text style={[type.label, { color: theme.colors.textPrimary }]}>Category</Text>
        {(['community', 'family', 'education'] as const).map((value) => (
          <Button
            key={value}
            label={`${category === value ? '● ' : '○ '}${value[0].toUpperCase()}${value.slice(1)}`}
            onPress={() => setCategory(value)}
            variant={category === value ? 'accent' : 'secondary'}
          />
        ))}
        {error ? <Text style={[type.bodySmall, { color: theme.colors.error }]} accessibilityRole="alert">{error}</Text> : null}
        <Button label="Create simulated pool" onPress={submit} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
});
