import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchRecentTransfers } from '../services/transferService';
import type { Transfer } from '../types';

const RECENT_LIMIT = 5;

type State = {
  recent: Transfer[];
  loading: boolean;
  error: string | null;
};

/**
 * Fetches only the most recent N transfers from Supabase using a server-side
 * LIMIT, instead of pulling every transfer and slicing client-side.
 */
export function useRecentTransfers() {
  const [state, setState] = useState<State>({
    recent: [],
    loading: true,
    error: null,
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (mounted.current) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const recent = await fetchRecentTransfers(RECENT_LIMIT);
      if (mounted.current) setState({ recent, loading: false, error: null });
    } catch {
      if (mounted.current) setState((s) => ({ ...s, loading: false, error: 'Could not load recent transfers.' }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}
