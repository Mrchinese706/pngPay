import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { radius, shadows, spacing, type } from '@/theme';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/utils';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError('');
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Request failed.');
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
            <Text style={{ fontSize: 40 }}>📧</Text>
          </View>
          <Text style={[type.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
            Reset link sent
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
            Check your inbox for the password reset link and tap it to set a new password.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.surface, ...shadows.lg }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.overlayLight }]}>
              <Text style={{ fontSize: 36 }}>🔑</Text>
            </View>

            <Text style={[type.h2, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
              Reset password
            </Text>
            <Text style={[type.bodySmall, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              Enter your email and we'll send a reset link.
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Email address"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />

            {serverError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.errorLight }]}>
                <Text style={[type.bodySmall, { color: colors.error }]}>⚠ {serverError}</Text>
              </View>
            ) : null}

            <Button
              label="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.xs,
    alignItems: 'stretch',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  errorBox: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
