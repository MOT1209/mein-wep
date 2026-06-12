/* src/js/config/supabase.js
   Tiny helper to read Supabase URL and anon key from <meta> tags.
   Only the public anon key is ever exposed to the client.
*/
export const getSupabaseUrl = () => {
  const meta = document.querySelector('meta[name="supabase-url"]');
  return meta ? meta.content : null;
};

export const getSupabaseAnonKey = () => {
  const meta = document.querySelector('meta[name="supabase-anon-key"]');
  return meta ? meta.content : null;
};