-- Fix: Drop existing policies before recreating
DROP POLICY IF EXISTS "Users can view own quran data" ON public.quran_pro_user_data;
DROP POLICY IF EXISTS "Users can insert own quran data" ON public.quran_pro_user_data;
DROP POLICY IF EXISTS "Users can update own quran data" ON public.quran_pro_user_data;
DROP POLICY IF EXISTS "Users can delete own quran data" ON public.quran_pro_user_data;

DROP POLICY IF EXISTS "Users can view own quran stats" ON public.quran_pro_stats;
DROP POLICY IF EXISTS "Users can upsert own quran stats" ON public.quran_pro_stats;
DROP POLICY IF EXISTS "Users can update own quran stats" ON public.quran_pro_stats;

-- Now recreate policies
CREATE POLICY "Users can view own quran data" ON public.quran_pro_user_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quran data" ON public.quran_pro_user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quran data" ON public.quran_pro_user_data
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quran data" ON public.quran_pro_user_data
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quran stats" ON public.quran_pro_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own quran stats" ON public.quran_pro_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quran stats" ON public.quran_pro_stats
  FOR UPDATE USING (auth.uid() = user_id);
