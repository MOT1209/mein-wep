import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabase.js';

let _supabaseClient = null;

export const initSupabase = () => {
  if (_supabaseClient) return _supabaseClient;

  if (typeof window !== 'undefined' && window.supabaseClient) {
    _supabaseClient = window.supabaseClient;
    return _supabaseClient;
  }

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    console.warn('Supabase config missing – check supabase-config.js');
    return null;
  }

  if (typeof supabase === 'undefined') {
    console.warn('Supabase JS library not loaded yet – will retry');
    return null;
  }

  try {
    _supabaseClient = supabase.createClient(url, anonKey);
    window.supabaseClient = _supabaseClient;
  } catch (err) {
    console.warn('Supabase init failed:', err);
    return null;
  }
  return _supabaseClient;
};

export const getClient = () => _supabaseClient;

export const onAuthStateChange = (onChange) => {
  const client = getClient();
  if (!client) return () => {};
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    onChange(session ?? null);
  });
  return () => {
    subscription?.unsubscribe?.();
  };
};

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
