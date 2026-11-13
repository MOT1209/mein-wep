
/**
 * Supabase public browser configuration.
 *
 * Keep only the anon publishable key here. Never place service_role keys,
 * private API keys, or database secrets in client-side JavaScript.
 */
const Rashid_SUPABASE = Object.freeze({
    url: 'https://kcltollasghlvuoxvjqa.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbHRvbGxhc2dobHZ1b3h2anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODI5NDksImV4cCI6MjA5Njg1ODk0OX0.w-op2d4THYCrKjql9t1j7BiBZM2krDEkw-vdOwFzXFE'
});

// Pages that only read public rows use this config with a plain fetch to
// PostgREST (see js/learning.js) and do not load the 218 KB client library.
window.RASHID_SUPABASE = Rashid_SUPABASE;

// Pages that do load supabase-js get the shared client as before.
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(
        Rashid_SUPABASE.url,
        Rashid_SUPABASE.anonKey
    );
}
