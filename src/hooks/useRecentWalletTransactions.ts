import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { fetchRecentWalletTransactions } from '../services/walletService';
import type { WalletTransaction } from '../types';

const RECENT_LIMIT = 5;

export function useRecentWalletTransactions() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recent = await fetchRecentWalletTransactions(RECENT_LIMIT);
      setTransactions(recent);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load wallet activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { transactions, loading, error, refresh };
}
