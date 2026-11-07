import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/hooks/useWallet';
import { topUpWallet } from '@/services/walletService';
import { spacing, type } from '@/theme';
import { formatCurrency, parsePositiveCurrencyAmount } from '@/utils';

const QUICK_AMOUNTS = [20, 50, 100];

export default function WalletTopUpScreen() {
  const { theme } = useTheme();
  const { balance, loading: walletLoading, error: walletError, refresh } = useWallet();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addFunds = async () => {
    setAmountError('');
    setServerError('');
    const parsedAmount = parsePositiveCurrencyAmount(amount);
    if (parsedAmount === null) {
      setAmountError('Enter an amount greater than zero, with up to 2 decimal places.');
      return;
    }

    setSubmitting(true);
    try {
      await topUpWallet(parsedAmount);
      router.back();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not add simulated funds.');
    } finally {
      setSubmitting(false);
    }
  };

  if (walletLoading && balance === null) return <LoadingView />;
  if (walletError && balance === null) {
    return <ErrorState message={walletError} onRetry={() => { void refresh(); }} />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
          <Text style={[type.label, { color: theme.colors.accentText }]}>‹ Back</Text>
        </TouchableOpacity>
        <Card style={styles.balanceCard}>
          <Text style={[type.label, { color: theme.colors.textSecondary }]}>Current simulated balance</Text>
          <Text style={[type.h2, { color: theme.colors.textPrimary, marginTop: spacing.xs }]}>
            {balance === null ? 'Unavailable' : formatCurrency(balance)}
          </Text>
        </Card>

        <Text style={[type.labelLarge, { color: theme.colors.textPrimary }]}>Amount to add (PGK)</Text>
        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              onPress={() => { setAmount(String(quickAmount)); setAmountError(''); }}
              style={[
                styles.quickAmount,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Add ${quickAmount} kina`}
            >
              <Text style={[type.label, { color: theme.colors.textPrimary }]}>
                {formatCurrency(quickAmount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextField
          label="Custom amount"
          value={amount}
          onChangeText={(value) => { setAmount(value); setAmountError(''); }}
          placeholder="e.g. 25.00"
          keyboardType="decimal-pad"
          error={amountError}
        />
        <Text style={[type.bodySmall, { color: theme.colors.textSecondary }]}>
          This records simulated funds in your PNGPay project wallet. It does not deposit real money.
        </Text>
        {serverError ? (
          <Text style={[type.bodySmall, { color: theme.colors.error }]}>{serverError}</Text>
        ) : null}
        <Button
          label="Add simulated funds"
          onPress={() => { void addFunds(); }}
          loading={submitting}
          disabled={balance === null}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md },
  balanceCard: { gap: spacing.xs },
  quickAmounts: { flexDirection: 'row', gap: spacing.sm },
  quickAmount: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.xs,
  },
});
