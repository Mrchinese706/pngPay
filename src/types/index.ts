export type Payee = {
  id: string;
  user_id: string;
  name: string;
  account_ref: string;
  created_at: string;
};

export type Transfer = {
  id: string;
  user_id: string;
  // payee_id is always provided on creation — createTransfer requires a non-null value.
  payee_id: string;
  amount: number;
  note: string | null;
  created_at: string;
  // Joined from payees table when fetched with select
  payees?: { name: string } | null;
};

export type WalletTransaction = {
  id: string;
  user_id: string;
  entry_type: 'credit' | 'debit';
  amount: number;
  description: string;
  transfer_id: string | null;
  created_at: string;
};

export type AppUser = {
  id: string;
  email: string;
};

export type { Pool, SavingsGoal } from '../services/goalService';
