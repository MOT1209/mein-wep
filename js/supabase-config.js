
/**
 * Supabase public browser configuration.
 *
 * Keep only the anon publishable key here. Never place service_role keys,
 * private API keys, or database secrets in client-side JavaScript.
 */
const Rashid_SUPABASE = Object.freeze({
    url: 'https://kcltollasghlvuoxvjqa.supabase.co',
    anonKey: 'sb_publishable_H6DYBEKQ3UAZp6qoI63K3Q_UhmyNycm'
});

if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(
        Rashid_SUPABASE.url,
        Rashid_SUPABASE.anonKey
    );
    console.log('Supabase client initialized with anon key');
} else {
    console.error('Supabase library not found. Make sure to include the CDN in your HTML.');
}
