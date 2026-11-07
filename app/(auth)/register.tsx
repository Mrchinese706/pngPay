import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
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
import { registerSchema, type RegisterFormData } from '@/utils';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    try {
      await signUp(data.email, data.password);
      setSuccess(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Registration failed.');
    }
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.successCenter}>
          <View style={[styles.successIcon, { backgroundColor: colors.successLight }]}>
            <Text style={{ fontSize: 44 }}>✉️</Text>
          </View>
          <Text style={[type.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
            Check your email
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
            We sent a confirmation link. Tap it to activate your account, then sign in.
          </Text>
          <View style={{ marginTop: spacing.xl, width: '100%' }}>
            <Button label="Go to Sign In" onPress={() => router.replace('/(auth)/login')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
            <Text style={[type.h2, { color: colors.textOnPrimary }]}>🪶 Create Account</Text>
            <Text style={[type.bodySmall, { color: colors.textOnPrimary + 'AA', marginTop: 4 }]}>
              Join PNGPay — Your PNG digital wallet
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...shadows.lg }]}>
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
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.password?.message}
                  hint="Minimum 8 characters"
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Confirm password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {serverError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.errorLight }]}>
                <Text style={[type.bodySmall, { color: colors.error }]}>⚠ {serverError}</Text>
              </View>
            ) : null}

            <Button
              label="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              size="lg"
            />

            <Text
              style={[type.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md }]}
            >
              By creating an account you agree this is a simulated university project wallet.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  topBar: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  formCard: {
    margin: spacing.lg,
    marginTop: -spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  errorBox: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  successCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
});
