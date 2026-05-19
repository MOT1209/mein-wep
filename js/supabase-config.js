
/**
 * Supabase public browser configuration.
 *
 * Keep only the anon publishable key here. Never place service_role keys,
 * private API keys, or database secrets in client-side JavaScript.
 */
const FROMLITEN_SUPABASE = Object.freeze({
    url: 'https://mspxwccbczhtaexwyhya.supabase.co',
    anonKey: 'sb_publishable_IvhF2CRGL0FTorPACmzh6g_-t94bItu'
});

if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(
        FROMLITEN_SUPABASE.url,
        FROMLITEN_SUPABASE.anonKey
    );
    console.log('Supabase client initialized with anon key');
} else {
    console.error('Supabase library not found. Make sure to include the CDN in your HTML.');
}
