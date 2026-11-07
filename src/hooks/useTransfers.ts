import { useCallback, useEffect, useRef, useState } from 'react';
import * as transferService from '../services/transferService';
import * as storageService from '../services/storageService';
import type { Transfer } from '../types';

type State = {
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  /** True when showing cached data that is older than the cache TTL. */
  isStale: boolean;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = typeof error.message === 'string' ? error.message : '';
    const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
    if (message) return code ? `Supabase error (${code}): ${message}` : message;
  }
  return fallback;
}

export function useTransfers() {
  const [state, setState] = useState<State>({
    transfers: [],
    loading: true,
    error: null,
    isOffline: false,
    isStale: false,
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (mounted.current) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const transfers = await transferService.fetchTransfers();
      await storageService.cacheTransfers(transfers);
      if (mounted.current) setState({ transfers, loading: false, error: null, isOffline: false, isStale: false });
    } catch (loadError) {
      let cached;
      try {
        cached = await storageService.getCachedTransfers();
      } catch (cacheError) {
        if (mounted.current) {
          setState({
            transfers: [],
            loading: false,
            error: `Could not load transfers or read the offline cache. ${getErrorMessage(cacheError, 'Offline cache is unavailable.')}`,
            isOffline: false,
            isStale: false,
          });
        }
        return;
      }

      if (mounted.current) {
        setState({
          transfers: cached?.data ?? [],
          loading: false,
          error: cached
            ? null
            : `Could not load transfers. ${getErrorMessage(loadError, 'Check your connection and Supabase configuration.')}`,
          isOffline: !!cached,
          isStale: cached?.stale ?? false,
        });
      }
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createTransfer = async (
    payee_id: string,
    amount: number,
    note?: string,
  ): Promise<string> => {
    const transfer = await transferService.createTransfer(payee_id, amount, note);
    await load();
    return transfer;
  };

  return { ...state, refresh: load, createTransfer };
}
