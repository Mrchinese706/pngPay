import { supabase } from './supabaseClient';

export type Pool = {
  id: string;
  name: string;
  purpose: string;
  target_amount: number;
  deadline: string | null;
  category: string;
  created_at: string;
  pool_contributions: { id: string; contributor_name: string; amount: number; created_at: string }[];
};

export type SavingsGoal = {
  id: string;
  name: string;
  category: string;
  target_amount: number;
  target_date: string | null;
  created_at: string;
  savings_contributions: { id: string; amount: number; created_at: string }[];
};

export async function fetchPools(): Promise<Pool[]> {
  const { data, error } = await supabase
    .from('pool_groups')
    .select('*, pool_contributions(id, contributor_name, amount, created_at)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Pool[];
}

export async function fetchPoolById(id: string): Promise<Pool> {
  const { data, error } = await supabase
    .from('pool_groups')
    .select('*, pool_contributions(id, contributor_name, amount, created_at)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Pool;
}

export async function createPool(input: {
  name: string;
  purpose: string;
  target_amount: number;
  deadline?: string;
  category: string;
}): Promise<Pool> {
  const { data, error } = await supabase
    .from('pool_groups')
    .insert({ ...input, deadline: input.deadline || null })
    .select('*, pool_contributions(id, contributor_name, amount, created_at)')
    .single();
  if (error) throw error;
  return data as Pool;
}

export async function addPoolContribution(
  poolId: string,
  amount: number,
  contributorName: string,
): Promise<void> {
  const { error } = await supabase
    .from('pool_contributions')
    .insert({ pool_id: poolId, amount, contributor_name: contributorName });
  if (error) throw error;
}

export async function fetchSavingsGoals(): Promise<SavingsGoal[]> {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*, savings_contributions(id, amount, created_at)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SavingsGoal[];
}

export async function createSavingsGoal(input: {
  name: string;
  category: string;
  target_amount: number;
  target_date?: string;
}): Promise<SavingsGoal> {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({ ...input, target_date: input.target_date || null })
    .select('*, savings_contributions(id, amount, created_at)')
    .single();
  if (error) throw error;
  return data as SavingsGoal;
}

export async function addSavingsContribution(goalId: string, amount: number): Promise<void> {
  const { error } = await supabase
    .from('savings_contributions')
    .insert({ goal_id: goalId, amount });
  if (error) throw error;
}
