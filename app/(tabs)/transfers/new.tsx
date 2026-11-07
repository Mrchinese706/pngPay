import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TextField } from '@/components/TextField';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { usePayees } from '@/hooks/usePayees';
import { useWallet } from '@/hooks/useWallet';
import { useTheme } from '@/context/ThemeContext';
import { fetchExchangeRates, type ExchangeRates } from '@/services/currencyService';
import { createTransfer } from '@/services/transferService';
import { saveTransferDraft, getTransferDraft, clearTransferDraft } from '@/services/storageService';
import { spacing, typography } from '@/theme';
import { transferSchema, formatCurrency, type TransferFormData } from '@/utils';

export default function NewTransferScreen() {
  const { payees, loading: payeesLoading, error: payeesError, refresh: refreshPayees } = usePayees();
  const { balance, loading: walletLoading, error: walletError, refresh: refreshWallet } = useWallet();
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const params = useLocalSearchParams<{ payee_id?: string; resume_draft?: string }>();

  const [serverError, setServerError] = useState('');
  const [payeeQuery, setPayeeQuery] = useState('');
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<TransferFormData | null>(null);
  const [recording, setRecording] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: { payee_id: params.payee_id ?? '', amount: '', note: '' },
  });

  const amountValue = watch('amount');
  const selectedPayeeId = watch('payee_id');

  // Restore draft on mount, then load exchange rates.
  // params.payee_id is in the dep array so deep-linked navigation re-runs this
  // effect if the user navigates to a different payee without unmounting.
  useEffect(() => {
    getTransferDraft().then((draft) => {
      if (draft) {
        // Only restore payee from draft when no payee was deep-linked.
        if (!params.payee_id) setValue('payee_id', draft.payee_id);
        // A newly created payee resumes the in-progress draft, but a fresh
        // send opened from a payee profile should not restore old form values.
        if (!params.payee_id || params.resume_draft === 'true') {
          setValue('amount', draft.amount);
          setValue('note', draft.note);
        }
      }
    });

    setRatesLoading(true);
    fetchExchangeRates()
      .then((r) => { setRates(r); setRatesLoading(false); })
      .catch(() => { setRatesError(true); setRatesLoading(false); });
  }, [params.payee_id, params.resume_draft, setValue]);

  // Save draft whenever form values change.
  useEffect(() => {
    const sub = watch((values) => {
      saveTransferDraft({
        payee_id: values.payee_id ?? '',
        amount: values.amount ?? '',
        note: values.note ?? '',
      });
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const onSubmit = (data: TransferFormData) => {
    setServerError('');
    if (balance === null) {
      setServerError('Your wallet balance is unavailable. Try again before sending.');
      return;
    }
    if (Number(data.amount) > balance) {
      setServerError(`Insufficient wallet balance. Available: ${formatCurrency(balance)}.`);
      return;
    }
    setPendingTransfer(data);
  };

  const confirmTransfer = async () => {
    if (!pendingTransfer) return;
    setRecording(true);
    let transferId: string;
    try {
      transferId = await createTransfer(
        pendingTransfer.payee_id,
        parseFloat(pendingTransfer.amount),
        pendingTransfer.note || undefined,
      );
    } catch (e) {
      setPendingTransfer(null);
      setServerError(e instanceof Error ? e.message : 'Transfer failed. No success was recorded.');
      setRecording(false);
      return;
    }

    let draftCleanupFailed = false;
    try {
      await clearTransferDraft();
    } catch {
      draftCleanupFailed = true;
    } finally {
      setRecording(false);
    }
    setPendingTransfer(null);
    router.replace({
      pathname: '/(tabs)/transfers/[id]',
      params: { id: transferId, draft_cleanup_failed: draftCleanupFailed ? 'true' : 'false' },
    });
  };

  if (payeesLoading || walletLoading) return <LoadingView />;
  if (payeesError || walletError) {
    return (
      <ErrorState
        message={[payeesError, walletError].filter(Boolean).join(' ')}
        onRetry={() => { void refreshPayees(); void refreshWallet(); }}
      />
    );
  }

  const parsedAmount = parseFloat(amountValue);
  const showConversion = rates && !isNaN(parsedAmount) && parsedAmount > 0;
  const showPayeeSearch = payees.length > 5;
  const filteredPayees = payees.filter((payee) =>
    !showPayeeSearch || payee.name.toLowerCase().includes(payeeQuery.trim().toLowerCase()),
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <Card style={styles.balanceCard}>
            <View style={styles.balanceSummary}>
              <View>
                <Text style={[typography.label, { color: colors.textSecondary }]}>Available wallet balance</Text>
                <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing.xs }]}>
                  {balance === null ? 'Unavailable' : formatCurrency(balance)}
                </Text>
              </View>
              <Button
                label="Add funds"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => router.push('/(tabs)/top-up')}
              />
            </View>
          </Card>

          {/* Payee picker */}
          <Text style={[typography.label, { color: colors.textPrimary }]}>Select Payee</Text>
          {payees.length === 0 ? (
            <View style={styles.noPayees}>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                No saved payees yet. Add one to continue.
              </Text>
              <Button
                label="Add payee"
                variant="secondary"
                onPress={() => router.push({
                  pathname: '/(tabs)/payees/new',
                  params: { returnToTransfer: 'true' },
                })}
              />
            </View>
          ) : (
            <>
              {showPayeeSearch ? (
                <TextField
                  label="Search saved payees"
                  value={payeeQuery}
                  onChangeText={setPayeeQuery}
                  placeholder="Type a name"
                />
              ) : null}
              <View style={styles.payeeList}>
                {filteredPayees.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.payeeChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      selectedPayeeId === p.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setValue('payee_id', p.id, { shouldValidate: true })}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selectedPayeeId === p.id }}
                  >
                    <View style={styles.payeeChipContent}>
                      <View style={[
                        styles.payeeInitial,
                        { backgroundColor: selectedPayeeId === p.id ? colors.textOnPrimary + '22' : colors.accent + '20' },
                      ]}>
                        <Text style={[
                          styles.payeeInitialText,
                          { color: selectedPayeeId === p.id ? colors.textOnPrimary : colors.accentText },
                        ]}>
                          {p.name.trim().charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[
                        styles.chipText,
                        { color: selectedPayeeId === p.id ? colors.textOnPrimary : colors.textPrimary },
                      ]}>
                        {p.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {filteredPayees.length === 0 ? (
                <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
                  No saved payees match “{payeeQuery}”.
                </Text>
              ) : null}
            </>
          )}
          {errors.payee_id ? <Text style={[styles.fieldError, { color: colors.error }]}>{errors.payee_id.message}</Text> : null}

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Amount (PGK)"
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                error={errors.amount?.message}
              />
            )}
          />

          {/* Live currency conversion — uses the actual amount entered */}
          {ratesLoading && !isNaN(parseFloat(amountValue)) && parseFloat(amountValue) > 0 ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>Loading exchange rates…</Text>
          ) : showConversion && rates ? (
            <Card style={styles.ratesCard}>
              <Text style={[typography.label, { color: colors.textPrimary }]}>Approximate equivalent</Text>
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                AUD {(parsedAmount * rates.aud).toFixed(2)}
              </Text>
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                USD {(parsedAmount * rates.usd).toFixed(2)}
              </Text>
            </Card>
          ) : null}
          {ratesError ? (
            <Text style={[styles.fieldError, { color: colors.error }]}>Exchange rates unavailable — PGK amount still valid.</Text>
          ) : null}
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Note (optional)"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                error={errors.note?.message}
                maxLength={200}
              />
            )}
          />

          {serverError ? <Text style={[styles.fieldError, { color: colors.error }]}>{serverError}</Text> : null}
        </ScrollView>
        <View style={[styles.submitBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Button label="Review transfer" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>
      </KeyboardAvoidingView>
      <ConfirmDialog
        visible={pendingTransfer !== null}
        title="Review simulated transfer"
        message={pendingTransfer
          ? `Send ${formatCurrency(Number(pendingTransfer.amount))} to ${payees.find((payee) => payee.id === pendingTransfer.payee_id)?.name ?? 'the selected payee'}? This records a simulated transaction only.`
          : ''}
        confirmLabel="Record transfer"
        onConfirm={confirmTransfer}
        onCancel={() => setPendingTransfer(null)}
        loading={recording}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md },
  submitBar: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  noPayees: { gap: spacing.sm, marginBottom: spacing.sm },
  balanceCard: { padding: spacing.md },
  balanceSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  payeeList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  payeeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  payeeChipContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  payeeInitial: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  payeeInitialText: { fontSize: 12, fontWeight: '700' },
  chipText: { ...typography.bodySmall },
  fieldError: { ...typography.caption },
  ratesCard: { gap: spacing.xs },
});
