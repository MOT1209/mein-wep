-- ==============================================================================
-- SUPABASE SETUP SCRIPT FOR Farm Game
-- Run this in your Supabase SQL Editor to add farm game tables.
--
-- ⚠️ This script ADDS new tables for the farm game. It does NOT drop or
-- modify existing tables. Safe to run on a live database.
-- ==============================================================================

-- ==============================================================================
-- 1. TABLE: game_saves (حفظات اللعبة)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.game_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id INTEGER NOT NULL DEFAULT 1,
  game_state JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, slot_id)
);

ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves" ON public.game_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves" ON public.game_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saves" ON public.game_saves
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves" ON public.game_saves
  FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 2. TABLE: player_stats (إحصائيات اللاعب)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stats JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON public.player_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own stats" ON public.player_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.player_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 3. TABLE: player_achievements (إنجازات اللاعب)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  achievements JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON public.player_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own achievements" ON public.player_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.player_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. TABLE: leaderboard (لوحة الصدارة)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  category TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  game_name TEXT DEFAULT 'farm-game',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, game_name)
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own score" ON public.leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own score" ON public.leaderboard
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. TABLE: daily_quests (المهام اليومية)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_data JSONB NOT NULL DEFAULT '{}',
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_date)
);

ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests" ON public.daily_quests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests" ON public.daily_quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests" ON public.daily_quests
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. TABLE: seasonal_events (الأحداث الموسمية)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.seasonal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON public.seasonal_events
  FOR SELECT USING (true);

-- ==============================================================================
-- 7. TABLE: game_inventory (مخزون اللعبة - للمشاركة عبر الأجهزة)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.game_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.game_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory" ON public.game_inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own inventory" ON public.game_inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON public.game_inventory
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- Indexes for performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_game_saves_user ON public.game_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_slot ON public.game_saves(slot_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_user ON public.player_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON public.leaderboard(category, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game ON public.leaderboard(game_name, category, score DESC);
CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date ON public.daily_quests(user_id, quest_date);
CREATE INDEX IF NOT EXISTS idx_game_inventory_user ON public.game_inventory(user_id);

-- ==============================================================================
-- Functions
-- ==============================================================================

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق التريجر على جميع جداول Farm Game
DO $$
BEGIN
  -- game_saves
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_game_saves_updated_at') THEN
    CREATE TRIGGER update_game_saves_updated_at
      BEFORE UPDATE ON public.game_saves
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  -- player_stats
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_player_stats_updated_at') THEN
    CREATE TRIGGER update_player_stats_updated_at
      BEFORE UPDATE ON public.player_stats
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  -- player_achievements
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_player_achievements_updated_at') THEN
    CREATE TRIGGER update_player_achievements_updated_at
      BEFORE UPDATE ON public.player_achievements
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  -- leaderboard
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_leaderboard_updated_at') THEN
    CREATE TRIGGER update_leaderboard_updated_at
      BEFORE UPDATE ON public.leaderboard
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  -- game_inventory
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_game_inventory_updated_at') THEN
    CREATE TRIGGER update_game_inventory_updated_at
      BEFORE UPDATE ON public.game_inventory
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ==============================================================================
-- Realtime (اختياري - للعب الجماعي)
-- ==============================================================================
DO $$
BEGIN
  -- تفعيل Realtime للجداول المطلوبة (آمن إعادة تشغيله)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.seasonal_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ==============================================================================
-- Success message
-- ==============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Farm Game tables created successfully!';
  RAISE NOTICE 'Tables: game_saves, player_stats, player_achievements, leaderboard, daily_quests, seasonal_events, game_inventory';
END $$;
