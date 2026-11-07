import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows, spacing, type } from '../theme';
import { Button } from './Button';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.card, ...shadows.lg },
          ]}
        >
          {/* Header accent line */}
          <View
            style={[
              styles.accentBar,
              { backgroundColor: destructive ? colors.danger : colors.accent },
            ]}
          />

          <View style={styles.body}>
            <Text style={[type.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              {title}
            </Text>
            <Text style={[type.body, { color: colors.textSecondary, lineHeight: 22 }]}>
              {message}
            </Text>
          </View>

          <View style={styles.actions}>
            <View style={styles.btn}>
              <Button
                label="Cancel"
                onPress={onCancel}
                variant="secondary"
                disabled={loading}
              />
            </View>
            <View style={styles.btn}>
              <Button
                label={confirmLabel}
                onPress={onConfirm}
                variant={destructive ? 'danger' : 'primary'}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  body: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  btn: { flex: 1 },
});
