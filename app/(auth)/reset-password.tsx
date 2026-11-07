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
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { spacing, typography } from '@/theme';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/utils';

/**
 * Handles the second half of the password-reset flow.
 *
 * The user arrives here by tapping the Supabase reset-password email link,
 * which deep-links to pngpay://reset-password. Supabase automatically
 * exchanges the token in the URL for a short-lived session, which means
 * supabase.auth.updateUser() is available immediately on this screen.
 */
export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError('');
    try {
      await updatePassword(data.password);
      setDone(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Could not update password.');
    }
  };

  if (done) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text style={styles.emoji}>✅</Text>
          <Text style={[typography.h2, { color: theme.colors.textPrimary }]}>Password updated</Text>
          <Text style={[typography.body, styles.msg, { color: theme.colors.textSecondary }]}>
            Your password has been changed. You can now sign in with your new password.
          </Text>
          <Button
            label="Go to Sign In"
            onPress={() => router.replace('/(auth)/login')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[typography.h1, { color: theme.colors.textPrimary }]}>Set new password</Text>
          <Text style={[typography.bodySmall, styles.subtitle, { color: theme.colors.textSecondary }]}>
            Choose a strong password for your PNGPay account.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="New Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Confirm New Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {serverError ? (
              <Text style={[styles.serverError, { color: theme.colors.error }]}>{serverError}</Text>
            ) : null}

            <Button
              label="Update Password"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
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
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xl },
  form: { gap: spacing.xs },
  serverError: { ...typography.bodySmall, marginBottom: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  emoji: { fontSize: 48 },
  msg: { textAlign: 'center' },
});
