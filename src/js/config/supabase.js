export const getSupabaseUrl = () => {
  const meta = document.querySelector('meta[name="supabase-url"]');
  if (meta) return meta.content;
  return window.Rashid_SUPABASE?.url || 'https://kcltollasghlvuoxvjqa.supabase.co';
};

export const getSupabaseAnonKey = () => {
  const meta = document.querySelector('meta[name="supabase-anon-key"]');
  if (meta) return meta.content;
  return window.Rashid_SUPABASE?.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbHRvbGxhc2dobHZ1b3h2anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODI5NDksImV4cCI6MjA5Njg1ODk0OX0.w-op2d4THYCrKjql9t1j7BiBZM2krDEkw-vdOwFzXFE';
};
