// URL polyfill must be the very first import so Supabase's fetch calls work on Android.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[PNGPay] Supabase credentials are missing.\n' +
    'Create a .env file in the project root with:\n' +
    '  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...\n' +
    'See .env.example for reference. Then restart the dev server.'
  );
}

// The new Supabase publishable key (sb_publishable_...) replaces the legacy
// anon JWT key. It must be sent on the apikey header — not as a JWT Bearer
// token — so we use a global fetch wrapper to inject it correctly.
const supabaseFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers((init.headers as HeadersInit) ?? {});
  headers.set('apikey', supabaseAnonKey);
  // Only set Authorization if not already set by the auth layer (user JWT).
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
  }
  return fetch(input, { ...init, headers });
};

// We use AsyncStorage (not SecureStore) because SecureStore requires a native build.
// The publishable key is safe to expose — RLS enforces data ownership on the server.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // detectSessionInUrl must be false in React Native — there is no browser URL bar.
    detectSessionInUrl: false,
  },
  global: {
    fetch: supabaseFetch,
  },
});
