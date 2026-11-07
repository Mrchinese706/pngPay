import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { BilumPattern } from '@/components/BilumPattern';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import type { AppearancePreference } from '@/context/ThemeContext';
import { radius, spacing, type } from '@/theme';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/utils';

// ─── Theme Selector ───────────────────────────────────────────────────────────

function ThemeSelector() {
  const { theme, themeId, appearance, appearanceError, setTheme } = useTheme();
  const { colors } = theme;
  const [saveError, setSaveError] = useState('');

  const options: { id: AppearancePreference; label: string; emoji: string; desc: string }[] = [
    { id: 'system', label: 'System default', emoji: '📱', desc: 'Follow your device settings' },
    { id: 'pacific', label: 'Pacific Modern', emoji: '🌊', desc: 'Light · Default' },
    { id: 'midnight', label: 'Premium Midnight', emoji: '🌙', desc: 'Dark · Premium' },
    { id: 'tropical', label: 'Tropical Energy', emoji: '🌺', desc: 'Vibrant · Energetic' },
  ];

  return (
    <Card style={{ backgroundColor: colors.card }}>
      <Text style={[type.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
        Appearance
      </Text>
      {options.map((opt) => {
        const selected = appearance === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => {
              setSaveError('');
              void setTheme(opt.id).catch(() => {
                setSaveError('Could not save your appearance preference. Please try again.');
              });
            }}
            style={[
              styles.themeOption,
              {
                backgroundColor: selected ? colors.accent + '18' : 'transparent',
                borderColor: selected ? colors.accent : colors.border,
                borderWidth: selected ? 2 : 1,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 24 }}>{opt.emoji}</Text>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[type.labelLarge, { color: colors.textPrimary }]}>{opt.label}</Text>
              <Text style={[type.caption, { color: colors.textMuted }]}>{opt.desc}</Text>
            </View>
            {selected && (
              <View style={[styles.selectedDot, { backgroundColor: colors.accent }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
      {saveError || appearanceError ? (
        <Text style={[type.caption, { color: colors.error }]} accessibilityRole="alert">
          {saveError || appearanceError}
        </Text>
      ) : null}
      {appearance === 'system' ? (
        <Text style={[type.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
          Using {themeId === 'midnight' ? 'dark' : 'light'} appearance from your device.
        </Text>
      ) : null}
    </Card>
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────

function ChangePasswordSection() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { updatePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError('');
    try {
      await updatePassword(data.password);
      setSuccess(true);
      reset();
      setTimeout(() => { setOpen(false); setSuccess(false); }, 2000);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Could not update password.');
    }
  };

  return (
    <Card style={{ backgroundColor: colors.card }}>
      <TouchableOpacity
        style={styles.sectionRow}
        onPress={() => { setOpen(o => !o); setSuccess(false); setServerError(''); }}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 20 }}>🔐</Text>
        <Text style={[type.labelLarge, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
          Change Password
        </Text>
        <Text style={[type.body, { color: colors.textMuted }]}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {success && (
        <View style={[styles.successMsg, { backgroundColor: colors.successLight }]}>
          <Text style={[type.label, { color: colors.success }]}>✅ Password updated successfully</Text>
        </View>
      )}

      {open && !success && (
        <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
          <Controller control={control} name="password"
            render={({ field: { onChange, value } }) => (
              <TextField label="New Password" value={value} onChangeText={onChange}
                secureTextEntry error={errors.password?.message} />
            )}
          />
          <Controller control={control} name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextField label="Confirm New Password" value={value} onChangeText={onChange}
                secureTextEntry error={errors.confirmPassword?.message} />
            )}
          />
          {serverError ? (
            <Text style={[type.bodySmall, { color: colors.error }]}>⚠ {serverError}</Text>
          ) : null}
          <Button label="Update Password" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>
      )}
    </Card>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError('');
    try {
      await signOut();
    } catch (e) {
      setSignOutError(e instanceof Error ? e.message : 'Sign out failed.');
      setSigningOut(false);
    }
  };

  const firstName = user?.email?.split('@')[0] ?? 'User';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar Header */}
        <View style={[styles.avatarHeader, { backgroundColor: colors.primary }]}>
          <BilumPattern width={400} height={160} opacity={0.08} />
          <View style={styles.avatarContent}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[type.h3, { color: colors.textOnPrimary, marginTop: spacing.sm }]}>
              {user?.email}
            </Text>
            <View style={[styles.badge, { backgroundColor: colors.accent + '30' }]}>
              <Text style={[type.caption, { color: colors.accentText }]}>PNGPay Member</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Account Info */}
          <Card style={{ backgroundColor: colors.card }}>
            <Text style={[type.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Account
            </Text>
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 18 }}>📧</Text>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[type.caption, { color: colors.textMuted }]}>Email</Text>
                <Text style={[type.body, { color: colors.textPrimary }]}>{user?.email}</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 18 }}>🆔</Text>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[type.caption, { color: colors.textMuted }]}>Account ID</Text>
                <Text style={[type.mono, { color: colors.textMuted }]} numberOfLines={1}>
                  {user?.id?.slice(0, 20)}…
                </Text>
              </View>
            </View>
          </Card>

          {/* Theme */}
          <ThemeSelector />

          {/* Change Password */}
          <ChangePasswordSection />

          {/* Disclaimer */}
          <Card variant="filled" style={{ borderColor: colors.warning, borderWidth: 1 }}>
            <Text style={[type.label, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
              ⚠️ Simulated Wallet
            </Text>
            <Text style={[type.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
              PNGPay is a university project. No real money is transferred. All balances and
              transactions are simulated and have no connection to any bank or financial institution.
            </Text>
          </Card>

          {signOutError ? (
            <Text style={[type.bodySmall, { color: colors.error, textAlign: 'center' }]}>
              {signOutError}
            </Text>
          ) : null}

          <Button
            label="Sign Out"
            onPress={handleSignOut}
            loading={signingOut}
            variant="danger"
          />

          <View style={{ height: spacing.lg }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  avatarHeader: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarContent: { alignItems: 'center', zIndex: 1 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
  badge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    marginTop: -spacing.lg,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  divider: { height: 1, marginVertical: spacing.sm },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  selectedDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center' },
  successMsg: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
});
