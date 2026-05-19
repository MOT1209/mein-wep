export function getSupabaseClient() {
    return window.supabaseClient || null;
}

function withTimeout(promise, label, timeoutMs = 3500) {
    return Promise.race([
        promise,
        new Promise((resolve) => {
            document.defaultView.setTimeout(() => resolve({ error: new Error(`${label} timed out`) }), timeoutMs);
        })
    ]);
}

export async function countProjects() {
    const client = getSupabaseClient();
    if (!client) return { count: null, error: new Error('Supabase client is not available') };

    const { count, error } = await withTimeout(
        client.from('projects').select('id', { count: 'exact', head: true }),
        'Supabase project count'
    );

    return { count, error };
}

export async function fetchPublicProjects() {
    const client = getSupabaseClient();
    if (!client) return { projects: null, error: new Error('Supabase client is not available') };

    const { data, error } = await withTimeout(
        client.from('projects').select('*').eq('status', 'Public').order('created_at', { ascending: false }),
        'Supabase public projects'
    );

    return { projects: data || [], error };
}

export async function incrementVisitorCount() {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await withTimeout(client.rpc('increment_visitor_count'), 'Supabase visitor count', 2500);
    if (error) console.warn('Visitor count sync failed:', error.message);
}
