import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { createPayee } from '@/services/payeeService';
import { spacing, typography } from '@/theme';
import { payeeSchema, type PayeeFormData } from '@/utils';

export default function NewPayeeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { returnToTransfer } = useLocalSearchParams<{ returnToTransfer?: string }>();
  const [serverError, setServerError] = useState('');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<PayeeFormData>({
    resolver: zodResolver(payeeSchema),
  });

  const onSubmit = async (data: PayeeFormData) => {
    setServerError('');
    try {
      const payee = await createPayee(data.name, data.account_ref);
      if (returnToTransfer === 'true') {
        router.replace({
          pathname: '/(tabs)/transfers/new',
          params: { payee_id: payee.id, resume_draft: 'true' },
        });
      } else {
        router.replace(`/(tabs)/payees/${payee.id}`);
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Could not create payee.');
    }
  };

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
          <Button label="Save Payee" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
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
