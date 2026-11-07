import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { fetchWalletBalance } from '../services/walletService';
import { getWalletErrorMessage } from '../utils/walletErrors';

export function useWallet() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBalance(await fetchWalletBalance());
    } catch (loadError) {
      setError(getWalletErrorMessage(loadError, 'Could not load wallet balance.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { balance, loading, error, refresh };
}
