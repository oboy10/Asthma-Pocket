import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createMockClient(): SupabaseClient {
  const noop = () => {};
  const noopPromise = () => Promise.resolve({ data: { user: null }, error: null });
  const noopSub = () => ({ data: { subscription: { unsubscribe: noop } } });
  return {
    auth: {
      getUser: noopPromise,
      onAuthStateChange: () => noopSub(),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Missing env' } as Error }),
      signInWithOtp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Missing env' } as Error }),
      signInWithOAuth: () => Promise.resolve({ data: { url: null }, error: { message: 'Missing env' } as Error }),
      exchangeCodeForSession: () => Promise.resolve({ data: { session: null, user: null }, error: { message: 'Missing env' } as Error }),
    },
  } as unknown as SupabaseClient;
}

export function createClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    return createMockClient();
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
}
