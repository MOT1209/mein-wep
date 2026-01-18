
/**
 * Supabase Configuration
 * Initialize the Supabase client for authentication and database access.
 */

// Supabase Project Configuration
const SUPABASE_URL = 'https://mspxwccbczhtaexwyhya.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IvhF2CRGL0FTorPACmzh6g_-t94bItu';

// Check if Supabase library is loaded
if (typeof supabase !== 'undefined') {
    // Initialize Supabase client
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase Client Initialized Successfully");
} else {
    console.error("❌ Supabase library not found! Make sure to include the CDN in your HTML.");
}
