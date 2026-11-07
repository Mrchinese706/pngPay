import { supabase } from './supabaseClient';
import type { WalletTransaction } from '../types';
import { getWalletErrorMessage } from '../utils/walletErrors';

export async function fetchWalletBalance(): Promise<number> {
  const { data, error } = await supabase
    .from('wallet_accounts')
    .select('balance')
    .single();
  if (error) throw error;

  const balance = Number(data.balance);
  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error('Supabase returned an invalid wallet balance.');
  }
  return balance;
}

export async function topUpWallet(amount: number): Promise<number> {
  const { data, error } = await supabase.rpc('top_up_wallet', { p_amount: amount });
  if (error) {
    throw new Error(getWalletErrorMessage(error, 'Could not add simulated funds.'));
  }

  const balance = Number(data);
  if (!Number.isFinite(balance) || balance < amount) {
    throw new Error('Supabase returned an invalid wallet balance after top-up.');
  }
  return balance;
}

export async function fetchRecentWalletTransactions(limit: number): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('id, user_id, entry_type, amount, description, transfer_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
  })) as WalletTransaction[];
}
