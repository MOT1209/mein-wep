-- Pin search_path on the updated_at trigger functions (Supabase advisor 0011).
-- Both bodies only call NOW(), which lives in pg_catalog and resolves with an
-- empty search_path. Applied to the production project on 2026-10-19.
alter function public.update_updated_at() set search_path = '';
alter function public.update_quran_pro_updated_at() set search_path = '';
