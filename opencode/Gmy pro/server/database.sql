-- Database Schema for Gym Pro Smart Trainer
-- Run this in Supabase SQL Editor

-- ============================================
-- Users table (for authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Profile table
-- ============================================
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT,
    age INTEGER,
    height FLOAT,
    weight FLOAT,
    target_calories INTEGER DEFAULT 2000,
    target_water INTEGER DEFAULT 8,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- Meals table
-- ============================================
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein FLOAT DEFAULT 0,
    carbs FLOAT DEFAULT 0,
    fat FLOAT DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meals(user_id, date);

-- ============================================
-- Water tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS public.water (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    today INTEGER DEFAULT 0,
    target INTEGER DEFAULT 8,
    history JSONB DEFAULT '{}',
    date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Progress photos table
-- ============================================
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    type TEXT DEFAULT 'front',
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_user ON public.photos(user_id);

-- ============================================
-- Vitals table
-- ============================================
CREATE TABLE IF NOT EXISTS public.vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    systolic INTEGER,
    diastolic INTEGER,
    heart_rate INTEGER,
    blood_sugar INTEGER,
    cholesterol INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitals_user ON public.vitals(user_id);

-- ============================================
-- Stress tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS public.stress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    level INTEGER CHECK (level >= 1 AND level <= 10),
    factors TEXT[],
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Workouts table
-- ============================================
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    duration INTEGER,
    calories INTEGER,
    exercises JSONB,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Users: Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Profile: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profile
    FOR UPDATE USING (auth.uid() = user_id);

-- Meals: Users can only access their own meals
CREATE POLICY "Users can view own meals" ON public.meals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON public.meals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON public.meals
    FOR DELETE USING (auth.uid() = user_id);

-- Water: Users can only access their own water data
CREATE POLICY "Users can view own water" ON public.water
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water" ON public.water
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water" ON public.water
    FOR UPDATE USING (auth.uid() = user_id);

-- Photos: Users can only access their own photos
CREATE POLICY "Users can view own photos" ON public.photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON public.photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON public.photos
    FOR DELETE USING (auth.uid() = user_id);

-- Vitals: Users can only access their own vitals
CREATE POLICY "Users can view own vitals" ON public.vitals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals" ON public.vitals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stress: Users can only access their own stress data
CREATE POLICY "Users can view own stress" ON public.stress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stress" ON public.stress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Workouts: Users can only access their own workouts
CREATE POLICY "Users can view own workouts" ON public.workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Storage Buckets (for images)
-- ============================================

-- Create bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for photo uploads
CREATE POLICY "Users can upload photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'progress-photos');

CREATE POLICY "Users can delete photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- Functions
-- ============================================

-- Function to get user from token (for API auth)
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
