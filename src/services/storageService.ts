import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Payee, Transfer } from '../types';

const KEYS = {
  payeesCache: 'cache_payees',
  transfersCache: 'cache_transfers',
  transferDraft: 'draft_transfer',
};

// How long cached data is considered fresh (24 hours in milliseconds).
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEnvelope<T> = {
  data: T;
  cachedAt: number; // Unix timestamp (ms)
};

function isExpired(cachedAt: number): boolean {
  return Date.now() - cachedAt > CACHE_TTL_MS;
}

// ─── Payees ──────────────────────────────────────────────────────────────────

export async function cachePayees(payees: Payee[]): Promise<void> {
  const envelope: CacheEnvelope<Payee[]> = { data: payees, cachedAt: Date.now() };
  await AsyncStorage.setItem(KEYS.payeesCache, JSON.stringify(envelope));
}

export type CachedResult<T> = { data: T; stale: boolean } | null;

export async function getCachedPayees(): Promise<CachedResult<Payee[]>> {
  const raw = await AsyncStorage.getItem(KEYS.payeesCache);
  if (!raw) return null;
  const envelope = JSON.parse(raw) as CacheEnvelope<Payee[]>;
  return { data: envelope.data, stale: isExpired(envelope.cachedAt) };
}

// ─── Transfers ───────────────────────────────────────────────────────────────

export async function cacheTransfers(transfers: Transfer[]): Promise<void> {
  const envelope: CacheEnvelope<Transfer[]> = { data: transfers, cachedAt: Date.now() };
  await AsyncStorage.setItem(KEYS.transfersCache, JSON.stringify(envelope));
}

export async function getCachedTransfers(): Promise<CachedResult<Transfer[]>> {
  const raw = await AsyncStorage.getItem(KEYS.transfersCache);
  if (!raw) return null;
  const envelope = JSON.parse(raw) as CacheEnvelope<Transfer[]>;
  return { data: envelope.data, stale: isExpired(envelope.cachedAt) };
}

// ─── Transfer Draft ───────────────────────────────────────────────────────────

export type TransferDraft = { payee_id: string; amount: string; note: string };

export async function saveTransferDraft(draft: TransferDraft): Promise<void> {
  await AsyncStorage.setItem(KEYS.transferDraft, JSON.stringify(draft));
}

export async function getTransferDraft(): Promise<TransferDraft | null> {
  const raw = await AsyncStorage.getItem(KEYS.transferDraft);
  return raw ? (JSON.parse(raw) as TransferDraft) : null;
}

export async function clearTransferDraft(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.transferDraft);
}
