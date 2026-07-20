-- ==============================================================================
-- SUPABASE SETUP SCRIPT FOR Quran Pro
-- Run this in your Supabase SQL Editor to add Quran Pro tables.
-- Safe to run on a live database (uses IF NOT EXISTS).
-- ==============================================================================

-- 1. TABLE: quran_pro_user_data (بيانات المستخدم - مفضلة، تقدم، إعدادات)
CREATE TABLE IF NOT EXISTS public.quran_pro_user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bookmarks JSONB DEFAULT '[]',
  reading_progress JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  last_position JSONB DEFAULT '{}',
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quran_pro_user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quran data" ON public.quran_pro_user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quran data" ON public.quran_pro_user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quran data" ON public.quran_pro_user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quran data" ON public.quran_pro_user_data
  FOR DELETE USING (auth.uid() = user_id);

-- 2. TABLE: quran_pro_stats (إحصائيات القراءة)
CREATE TABLE IF NOT EXISTS public.quran_pro_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_read_verses INT DEFAULT 0,
  total_listening_minutes INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_read_date DATE,
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quran_pro_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quran stats" ON public.quran_pro_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own quran stats" ON public.quran_pro_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quran stats" ON public.quran_pro_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_quran_pro_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quran_pro_user_data_updated_at ON public.quran_pro_user_data;
CREATE TRIGGER update_quran_pro_user_data_updated_at
  BEFORE UPDATE ON public.quran_pro_user_data
  FOR EACH ROW EXECUTE FUNCTION update_quran_pro_updated_at();

DROP TRIGGER IF EXISTS update_quran_pro_stats_updated_at ON public.quran_pro_stats;
CREATE TRIGGER update_quran_pro_stats_updated_at
  BEFORE UPDATE ON public.quran_pro_stats
  FOR EACH ROW EXECUTE FUNCTION update_quran_pro_updated_at();

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_quran_pro_user_data_user ON public.quran_pro_user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_pro_stats_user ON public.quran_pro_stats(user_id);

-- 5. Realtime
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.quran_pro_user_data; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.quran_pro_stats; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ Quran Pro tables created successfully!';
  RAISE NOTICE 'Tables: quran_pro_user_data, quran_pro_stats';
END $$;
