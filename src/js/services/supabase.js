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

export async function fetchPublicModels() {
    return fetchPublicContent('models');
}

export async function fetchPublicVaultItems() {
    return fetchPublicContent('vault_items');
}

export async function createContentItem(table, item) {
    const client = getSupabaseClient();
    if (!client) return { item: null, error: new Error('Supabase client is not available') };

    const { data, error } = await withTimeout(
        client.from(table).insert(item).select().single(),
        `Supabase create ${table}`
    );

    return { item: data, error };
}

export async function deleteContentItem(table, id) {
    const client = getSupabaseClient();
    if (!client) return { error: new Error('Supabase client is not available') };

    const { error } = await withTimeout(
        client.from(table).delete().eq('id', id),
        `Supabase delete ${table}`
    );

    return { error };
}

export async function isCurrentUserAdmin() {
    const client = getSupabaseClient();
    if (!client?.auth) return false;

    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return false;

    const { data, error } = await withTimeout(
        client.rpc('is_admin'),
        'Supabase admin check',
        2500
    );

    if (error) {
        console.warn('Admin check failed:', error.message);
        return false;
    }

    return Boolean(data);
}

export function subscribeToContent(table, callback) {
    const client = getSupabaseClient();
    if (!client?.channel) return null;

    const channel = client
        .channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
        .subscribe();

    return () => client.removeChannel(channel);
}

export async function incrementVisitorCount() {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await withTimeout(client.rpc('increment_visitor_count'), 'Supabase visitor count', 2500);
    if (error) console.warn('Visitor count sync failed:', error.message);
}

async function fetchPublicContent(table) {
    const client = getSupabaseClient();
    if (!client) return { items: null, error: new Error('Supabase client is not available') };

    const { data, error } = await withTimeout(
        client.from(table).select('*').eq('status', 'Public').order('sort_order', { ascending: true }),
        `Supabase public ${table}`
    );

    return { items: data || [], error };
}
