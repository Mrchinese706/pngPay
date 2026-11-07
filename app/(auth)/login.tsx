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
import { BilumPattern } from '@/components/BilumPattern';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { radius, shadows, spacing, type } from '@/theme';
import { loginSchema, type LoginFormData } from '@/utils';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    try {
      await signIn(data.email, data.password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign in failed.';
      setServerError(msg.includes('Invalid') ? 'Incorrect email or password.' : msg);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Brand Header */}
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <BilumPattern width={400} height={220} opacity={0.1} />
            <View style={styles.brandMark}>
              <View style={[styles.brandIcon, { backgroundColor: colors.accent }]}>
                <Text style={{ fontSize: 32 }}>🪶</Text>
              </View>
              <Text style={[type.h1, { color: colors.textOnPrimary, marginTop: spacing.md }]}>
                PNGPay
              </Text>
              <Text style={[type.bodySmall, { color: colors.textOnPrimary + 'AA', marginTop: 4 }]}>
                Your money. Your people. Your PNG.
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...shadows.lg }]}>
            <Text style={[type.h2, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
              Welcome back
            </Text>
            <Text style={[type.bodySmall, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              Sign in to your PNGPay account
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
                />
              )}
            />

            {serverError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.errorLight }]}>
                <Text style={[type.bodySmall, { color: colors.error }]}>⚠ {serverError}</Text>
              </View>
            ) : null}

            <Button
              label="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              size="lg"
            />

            <View style={styles.links}>
              <Text
                onPress={() => router.push('/(auth)/forgot-password')}
                accessibilityRole="link"
                style={[type.label, { color: colors.accentText, textAlign: 'center' }]}
              >
                Forgot password?
              </Text>
              <Text
                onPress={() => router.push('/(auth)/register')}
                accessibilityRole="link"
                style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}
              >
                Don't have an account?{' '}
                <Text style={{ color: colors.accentText, fontWeight: '600' }}>Register</Text>
              </Text>
            </View>
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
  header: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  brandMark: { alignItems: 'center', zIndex: 1 },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  links: { marginTop: spacing.lg, gap: spacing.xs },
});
