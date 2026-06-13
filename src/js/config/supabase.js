export const getSupabaseUrl = () => {
  const meta = document.querySelector('meta[name="supabase-url"]');
  if (meta) return meta.content;
  return window.Rashid_SUPABASE?.url || 'https://kcltollasghlvuoxvjqa.supabase.co';
};

export const getSupabaseAnonKey = () => {
  const meta = document.querySelector('meta[name="supabase-anon-key"]');
  if (meta) return meta.content;
  return window.Rashid_SUPABASE?.anonKey || 'sb_publishable_H6DYBEKQ3UAZp6qoI63K3Q_UhmyNycm';
};
