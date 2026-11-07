const WALLET_MIGRATION =
  'Simulated wallet database is not installed. Run supabase/migrations/20261107000002_simulated_wallet.sql in the Supabase SQL Editor, then reload the app.';

export function getWalletErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) return fallback;

  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  const message = 'message' in error && typeof error.message === 'string' ? error.message : '';

  if (
    (code === 'PGRST205' && /wallet_accounts|wallet_transactions/i.test(message)) ||
    (code === 'PGRST202' && /top_up_wallet|create_wallet_transfer/i.test(message))
  ) {
    return WALLET_MIGRATION;
  }

  if (message) return code ? `Supabase error (${code}): ${message}` : message;
  return fallback;
}
