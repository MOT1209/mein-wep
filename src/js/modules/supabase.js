/* src/js/modules/supabase.js
   Initializes the Supabase client from meta‑tags (set in index.html) and
   exposes:
     - supabase client (getClient)
     - auth state listener (onAuthStateChange)
     - helpers for public data fetching
     - realtime subscription helper
   Only the public anon key is ever exposed.
*/
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabase.js';

// eslint-disable-next-line no-undef
let _supabaseClient = null;

/** Lazily creates the singleton Supabase client */
export const initSupabase = () => {
  if (_supabaseClient) return _supabaseClient;
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    console.error('Supabase URL or anon key missing – check <meta> tags in index.html');
    return null;
  }
  _supabaseClient = supabase.createClient(url, anonKey);
  return _supabaseClient;
};

/** Returns the initialized client (or null) */
export const getClient = () => _supabaseClient;

/**
 * Subscribe to auth state changes.
 * @param {Function(UserSession|null)} onChange – called whenever the session changes
 */
export const onAuthStateChange = (onChange) => {
  const client = getClient();
  if (!client) return () => {}; // no‑op
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    onChange(session ?? null);
  });
  return () => {
    // unsubscribe
    client.removeSubscription(subscription);
  };
};

/** Fetch public rows from any table (used by vault sections) */
export const fetchPublic = async (table, options = {}) => {
  const client = getClient();
  if (!client) return { data: null, error: new Error('Supabase client not ready') };
  const { select = '*', statusEq = 'Public', order = { column: 'created_at', ascending: false } } = options;
  const { data, error } = await client
    .from(table)
    .select(select)
    .eq('status', statusEq)
    .order(order.column, { ascending: order.ascending });
  return { data: data ?? [], error };
};

/** Realtime subscription helper – returns an unsubscribe function */
export const subscribe = (table, callback) => {
  const client = getClient();
  if (!client) return () => {};
  const channel = client
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      callback(payload);
    })
    .subscribe();
  return () => client.removeChannel(channel);
};