-- ==============================================================================
-- Update vault_items table for the new tab-based vault
-- Run this in Supabase SQL Editor
-- ==============================================================================

-- Add new columns (safe to run multiple times)
alter table public.vault_items
  add column if not exists content text default '',
  add column if not exists file_url text default '',
  add column if not exists file_type text default '',
  add column if not exists category text default 'prompts',
  add column if not exists tags text[] default '{}',
  add column if not exists locked boolean default false;

-- Drop old policies
drop policy if exists "Vault items read access" on public.vault_items;
drop policy if exists "Public vault items are viewable by everyone" on public.vault_items;
drop policy if exists "Admins can view all vault items" on public.vault_items;
drop policy if exists "Admins can insert vault items" on public.vault_items;
drop policy if exists "Admins can update vault items" on public.vault_items;
drop policy if exists "Admins can delete vault items" on public.vault_items;

-- Create clean policies
create policy "Anyone can read Public vault items"
on public.vault_items for select
using (status = 'Public');

create policy "Authenticated users can read all vault items"
on public.vault_items for select
to authenticated using (true);

create policy "Admins can insert vault items"
on public.vault_items for insert
to authenticated with check (public.is_admin());

create policy "Admins can update vault items"
on public.vault_items for update
to authenticated using (public.is_admin());

create policy "Admins can delete vault items"
on public.vault_items for delete
to authenticated using (public.is_admin());

-- Seed initial vault items (safe: ON CONFLICT skips duplicates)
insert into public.vault_items (title, description, icon_class, category, tags, content, locked, status, sort_order)
values
('System Prompt Engineer', 'Expert-level system prompt for coding assistants.', 'fas fa-message', 'prompts', ARRAY['gemini', 'system', 'coding'], 'You are a senior full-stack engineer with deep expertise in JavaScript, TypeScript, React, Node.js, and modern web APIs. Analyze the problem step by step, consider edge cases, and provide clean, well-structured solutions with proper error handling.', false, 'Public', 10),
('Code Review Prompt', 'Review code for bugs, performance, and best practices.', 'fas fa-code-review', 'prompts', ARRAY['chatgpt', 'code-review', 'best-practices'], 'Review the following code for: 1) Logic errors and edge cases 2) Performance bottlenecks 3) Security vulnerabilities 4) Adherence to best practices. Provide specific line-by-line feedback.', false, 'Public', 20),
('useDebounce Hook', 'React hook for debouncing values.', 'fas fa-code', 'code', ARRAY['react', 'hooks', 'javascript'], 'export function useDebounce(value, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n  return debounced;\n}', false, 'Public', 30),
('Fetch Wrapper', 'Typed fetch wrapper with error handling.', 'fas fa-code', 'code', ARRAY['typescript', 'api', 'utility'], 'export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {\n  const res = await fetch(url, {\n    headers: { "Content-Type": "application/json", ...init?.headers },\n    ...init\n  });\n  if (!res.ok) throw new Error(`API error: ${res.status}`);\n  return res.json();\n}', false, 'Public', 40),
('Hero Background', 'Gradient background for hero sections.', 'fas fa-image', 'media', ARRAY['design', 'gradient', 'dark-mode'], '', false, 'Public', 50),
('Brand Logo Pack', 'Brand logos in multiple sizes.', 'fas fa-images', 'media', ARRAY['icons', 'brand', 'vector'], '', false, 'Public', 60),
('Supabase Schema Guide', 'How to design RLS policies and tables.', 'fas fa-book', 'docs', ARRAY['supabase', 'database', 'guide'], '1. Define tables with proper foreign keys\n2. Enable RLS on every table\n3. Create policies with `security definer` where needed\n4. Use `auth.uid()` for user-specific access\n5. Test policies with anon and authenticated roles', false, 'Public', 70),
('Deployment Checklist', 'Pre-deployment verification steps.', 'fas fa-list-check', 'docs', ARRAY['devops', 'vercel', 'pwa'], '□ Environment variables set\n□ Build passes\n□ Lighthouse > 90\n□ PWA manifest valid\n□ Sitemap submitted\n□ Analytics configured\n□ CSP headers correct', false, 'Public', 80),
('Portfolio v1 Assets', 'Original design files from v1.', 'fas fa-archive', 'archives', ARRAY['backup', 'legacy', 'v1'], '', false, 'Public', 90),
('Old Blog Export', 'Blog posts archive from 2022-2023.', 'fas fa-file-zipper', 'archives', ARRAY['backup', 'blog', 'export'], '', false, 'Public', 100)
on conflict (id) do nothing;
