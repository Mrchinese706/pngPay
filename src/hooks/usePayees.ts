import { useCallback, useEffect, useRef, useState } from 'react';
import * as payeeService from '../services/payeeService';
import * as storageService from '../services/storageService';
import type { Payee } from '../types';

type State = {
  payees: Payee[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  /** True when showing cached data that is older than the cache TTL. */
  isStale: boolean;
};

export function usePayees() {
  const [state, setState] = useState<State>({
    payees: [],
    loading: true,
    error: null,
    isOffline: false,
    isStale: false,
  });
  // Tracks whether the component is still mounted to avoid state updates after unmount.
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (mounted.current) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const payees = await payeeService.fetchPayees();
      await storageService.cachePayees(payees);
      if (mounted.current) setState({ payees, loading: false, error: null, isOffline: false, isStale: false });
    } catch (loadError) {
      let cached;
      try {
        cached = await storageService.getCachedPayees();
      } catch (cacheError) {
        if (mounted.current) {
          setState({
            payees: [],
            loading: false,
            error: `Could not load payees or read the offline cache. ${cacheError instanceof Error ? cacheError.message : ''}`.trim(),
            isOffline: false,
            isStale: false,
          });
        }
        return;
      }

      if (mounted.current) {
        setState({
          payees: cached?.data ?? [],
          loading: false,
          error: cached
            ? null
            : `Could not load payees. ${loadError instanceof Error ? loadError.message : 'Check your connection and Supabase configuration.'}`,
          isOffline: !!cached,
          isStale: cached?.stale ?? false,
        });
      }
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createPayee = async (name: string, account_ref: string): Promise<Payee> => {
    const payee = await payeeService.createPayee(name, account_ref);
    await load();
    return payee;
  };

  const updatePayee = async (id: string, name: string, account_ref: string): Promise<Payee> => {
    const payee = await payeeService.updatePayee(id, name, account_ref);
    await load();
    return payee;
  };

  const deletePayee = async (id: string): Promise<void> => {
    await payeeService.deletePayee(id);
    await load();
  };

  return { ...state, refresh: load, createPayee, updatePayee, deletePayee };
}
