import { useCallback, useEffect, useState } from 'react';
import { Share, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { fetchTransferById } from '@/services/transferService';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { spacing, typography, type } from '@/theme';
import { formatCurrency, formatDate } from '@/utils';
import type { Transfer } from '@/types';

export default function TransferDetailScreen() {
  const { id, draft_cleanup_failed: draftCleanupFailed } =
    useLocalSearchParams<{ id: string; draft_cleanup_failed?: string }>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareError, setShareError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTransferById(id);
      setTransfer(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load transfer details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={() => { void load(); }} />;
  if (!transfer) return null;

  const shareReceipt = async () => {
    setShareError('');
    try {
      await Share.share({
        title: 'PNGPay simulated transfer receipt',
        message: [
          'PNGPay — simulated transaction receipt',
          `Amount: ${formatCurrency(transfer.amount)}`,
          `To: ${transfer.payees?.name ?? 'Unknown payee'}`,
          `Date: ${formatDate(transfer.created_at)}`,
          `Reference: ${transfer.id}`,
          'This is a simulated record only. No real money was transferred.',
          `Verify in PNGPay: pngpay:///transfers/${transfer.id}`,
        ].join('\n'),
      });
    } catch (shareError) {
      setShareError(shareError instanceof Error ? shareError.message : 'Could not share this receipt.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={[styles.amountWrap, { backgroundColor: theme.colors.primary }]}>
          <View style={[styles.statusIcon, { backgroundColor: theme.colors.successLight }]}>
            <Text style={{ color: theme.colors.success, fontSize: 24 }} accessibilityLabel="Recorded successfully">✓</Text>
          </View>
          <Text style={[typography.label, { color: theme.colors.balanceCardText }]}>Transfer recorded</Text>
          <Text style={[styles.amount, { color: theme.colors.balanceAmountText }]}>{formatCurrency(transfer.amount)}</Text>
          <Text style={[type.caption, { color: theme.colors.balanceCardText, textAlign: 'center', marginTop: spacing.sm }]}>
            Verified from your PNGPay transaction record
          </Text>
        </Card>
        {draftCleanupFailed === 'true' ? (
          <Text style={[typography.caption, { color: theme.colors.warning, textAlign: 'center' }]}>
            The transfer is recorded, but the saved form draft could not be cleared.
          </Text>
        ) : null}

        <Card>
          <Row label="From" value={user?.email ?? 'Your PNGPay account'} theme={theme} />
          <Row label="To" value={transfer.payees?.name ?? 'Unknown payee'} theme={theme} />
          <Row label="Date and time" value={new Date(transfer.created_at).toLocaleString('en-AU')} theme={theme} />
          {transfer.note ? <Row label="Description" value={transfer.note} theme={theme} /> : null}
          <Row label="Status" value="Recorded · Simulated" theme={theme} />
          <Row label="Reference ID" value={transfer.id} mono theme={theme} />
        </Card>

        <Card style={styles.qrCard}>
          <Text style={[type.h4, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
            Verify this receipt in PNGPay
          </Text>
          <Text style={[type.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
            Scanning opens the receipt reference. PNGPay checks the saved transaction before displaying it.
          </Text>
          <View
            accessible
            accessibilityLabel="QR code linking to this PNGPay receipt"
            style={styles.qrWrap}
          >
            <QRCode
              value={`pngpay:///transfers/${transfer.id}`}
              size={164}
              color={theme.colors.primary}
              backgroundColor={theme.colors.card}
            />
          </View>
        </Card>

        <Button label="Share receipt" variant="secondary" onPress={shareReceipt} />
        {shareError ? <Text style={[typography.caption, { color: theme.colors.error }]}>{shareError}</Text> : null}
        <Text style={[styles.disclaimer, { color: theme.colors.textMuted }]}>
          This receipt is verified by loading its reference from PNGPay. It is not proof of a real-world payment.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  mono = false,
  theme,
}: {
  label: string;
  value: string;
  mono?: boolean;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <View style={styles.row}>
      <Text style={[typography.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[
        typography.body,
        { color: theme.colors.textPrimary },
        mono && { fontFamily: 'monospace', fontSize: 12, color: theme.colors.textMuted },
      ]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md },
  amountWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: 16,
  },
  statusIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  qrCard: { alignItems: 'center', gap: spacing.sm },
  qrWrap: { padding: spacing.md, backgroundColor: '#FFFFFF', borderRadius: 8, marginTop: spacing.sm },
  amount: { fontSize: 36, fontWeight: '700', marginTop: spacing.sm },
  row: { marginBottom: spacing.md },
  disclaimer: { ...typography.caption, textAlign: 'center', padding: spacing.md },
});
