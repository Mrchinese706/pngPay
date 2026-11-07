import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { usePayees } from '@/hooks/usePayees';
import { fetchPayeeById } from '@/services/payeeService';
import { useTheme } from '@/context/ThemeContext';
import { spacing, typography } from '@/theme';
import { formatDate } from '@/utils';
import type { Payee } from '@/types';

export default function PayeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { deletePayee } = usePayees();
  const { theme } = useTheme();
  const { colors } = theme;

  const [payee, setPayee] = useState<Payee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPayeeById(id);
      setPayee(data);
    } catch {
      setError('Could not load payee details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePayee(id);
      router.back();
    } catch {
      setDeleteError('Delete failed. Please try again.');
      setShowConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error && !payee) return <ErrorState message={error} onRetry={() => { void load(); }} />;
  if (!payee) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{payee.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>{payee.name}</Text>
        </View>

        <Card>
          <Text style={[typography.label, { color: colors.textSecondary }]}>Account Reference</Text>
          <Text style={[typography.body, styles.value, { color: colors.textPrimary }]}>{payee.account_ref}</Text>
          <Text style={[typography.label, { color: colors.textSecondary }]}>Added</Text>
          <Text style={[typography.body, { color: colors.textPrimary }]}>{formatDate(payee.created_at)}</Text>
        </Card>

        {deleteError ? <Text style={[styles.deleteError, { color: colors.error }]}>{deleteError}</Text> : null}

        <Button
          label="Send Money to This Payee"
          onPress={() => router.push({ pathname: '/(tabs)/transfers/new', params: { payee_id: payee.id } })}
        />
        <Button
          label="Edit Payee"
          variant="secondary"
          onPress={() => router.push(`/(tabs)/payees/edit/${payee.id}`)}
        />
        <Button
          label="Delete Payee"
          variant="danger"
          onPress={() => setShowConfirm(true)}
        />
      </ScrollView>

      <ConfirmDialog
        visible={showConfirm}
        title="Delete Payee"
        message={`Are you sure you want to delete "${payee.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md },
  avatarWrap: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.md },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '700' },
  value: { marginBottom: spacing.md },
  deleteError: { ...typography.bodySmall, textAlign: 'center' },
});
