import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { LoadingView, ErrorState } from '@/components/StateViews';
import { usePayees } from '@/hooks/usePayees';
import { fetchPayeeById } from '@/services/payeeService';
import { useTheme } from '@/context/ThemeContext';
import { spacing, typography } from '@/theme';
import { payeeSchema, type PayeeFormData } from '@/utils';

export default function EditPayeeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updatePayee } = usePayees();
  const { theme } = useTheme();
  const router = useRouter();

  const [loadError, setLoadError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [serverError, setServerError] = useState('');

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PayeeFormData>({
    resolver: zodResolver(payeeSchema),
  });

  useEffect(() => {
    fetchPayeeById(id)
      .then((p) => reset({ name: p.name, account_ref: p.account_ref }))
      .catch((e: unknown) => setLoadError(e instanceof Error ? e.message : 'Could not load payee.'))
      .finally(() => setLoadingData(false));
  }, [id, reset]);

  const onSubmit = async (data: PayeeFormData) => {
    setServerError('');
    try {
      await updatePayee(id, data.name, data.account_ref);
      // Go back to detail screen — it will reload fresh data.
      router.back();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Update failed.');
    }
  };

  if (loadingData) return <LoadingView />;
  if (loadError) return <ErrorState message={loadError} onRetry={() => router.back()} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextField label="Full Name" value={value} onChangeText={onChange} error={errors.name?.message} maxLength={80} />
            )}
          />
          <Controller
            control={control}
            name="account_ref"
            render={({ field: { onChange, value } }) => (
              <TextField label="Account Reference" value={value} onChangeText={onChange} error={errors.account_ref?.message} maxLength={40} />
            )}
          />
          {serverError ? <Text style={[styles.serverError, { color: theme.colors.error }]}>{serverError}</Text> : null}
          <Button label="Save Changes" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.xs },
  serverError: { ...typography.bodySmall },
});
