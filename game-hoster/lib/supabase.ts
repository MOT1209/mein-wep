import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspxwccbczhtaexwyhya.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_IvhF2CRGL0FTorPACmzh6g_-t94bItu';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
