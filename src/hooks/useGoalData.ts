import { useCallback, useEffect, useState } from 'react';
import {
  fetchPools,
  fetchSavingsGoals,
  type Pool,
  type SavingsGoal,
} from '../services/goalService';

function getLoadErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = typeof error.message === 'string' ? error.message : '';
    const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
    if (message) return code ? `Supabase error (${code}): ${message}` : message;
  }
  return fallback;
}

function isMissingGoalSchema(error: string | null): boolean {
  return !!error && (
    /\b(?:42P01|PGRST205)\b/i.test(error)
    || /\b(?:pool_groups|pool_contributions|savings_goals|savings_contributions)\b.*(?:does not exist|not found|schema cache)/i.test(error)
  );
}

export function usePools() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPools(await fetchPools());
    } catch (loadError) {
      setError(getLoadErrorMessage(loadError, 'Could not load pools.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { pools, loading, error, migrationRequired: isMissingGoalSchema(error), refresh };
}

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setGoals(await fetchSavingsGoals());
    } catch (loadError) {
      setError(getLoadErrorMessage(loadError, 'Could not load savings goals.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { goals, loading, error, migrationRequired: isMissingGoalSchema(error), refresh };
}
