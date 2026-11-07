import { supabase } from './supabaseClient';
import type { Transfer } from '../types';
import { getWalletErrorMessage } from '../utils/walletErrors';

function normalizeTransfer(transfer: Transfer): Transfer {
  return { ...transfer, amount: Number(transfer.amount) };
}

export async function fetchTransfers(): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from('transfers')
    .select('*, payees(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Transfer[]).map(normalizeTransfer);
}

export async function fetchTransferById(id: string): Promise<Transfer> {
  const { data, error } = await supabase
    .from('transfers')
    .select('*, payees(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return normalizeTransfer(data as Transfer);
}

export async function fetchRecentTransfers(limit: number): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from('transfers')
    .select('*, payees(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Transfer[]).map(normalizeTransfer);
}

export async function createTransfer(
  payee_id: string,
  amount: number,
  note?: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('create_wallet_transfer', {
    p_payee_id: payee_id,
    p_amount: amount,
    p_note: note ?? null,
  });
  if (error) {
    throw new Error(getWalletErrorMessage(error, 'Transfer failed. No success was recorded.'));
  }
  if (typeof data !== 'string' || !data) {
    throw new Error('Supabase did not return the recorded transfer reference.');
  }
  return data;
}
