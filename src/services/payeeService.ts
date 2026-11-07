import { supabase } from './supabaseClient';
import type { Payee } from '../types';

export async function fetchPayees(): Promise<Payee[]> {
  const { data, error } = await supabase
    .from('payees')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Payee[];
}

export async function fetchPayeeById(id: string): Promise<Payee> {
  const { data, error } = await supabase.from('payees').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Payee;
}

export async function createPayee(name: string, account_ref: string): Promise<Payee> {
  const { data, error } = await supabase
    .from('payees')
    .insert({ name, account_ref })
    .select()
    .single();
  if (error) throw error;
  return data as Payee;
}

export async function updatePayee(
  id: string,
  name: string,
  account_ref: string,
): Promise<Payee> {
  const { data, error } = await supabase
    .from('payees')
    .update({ name, account_ref })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Payee;
}

export async function deletePayee(id: string): Promise<void> {
  const { error } = await supabase.from('payees').delete().eq('id', id);
  if (error) throw error;
}
