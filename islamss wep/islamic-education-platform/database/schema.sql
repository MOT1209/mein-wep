-- Supabase SQL Schema for Islamic Education Platform

-- 1. Quran Table
CREATE TABLE public.quran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sura_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    arabic_text TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    tafsir_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Hadith Table
CREATE TABLE public.hadith (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    arabic_text TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    authenticity_grade TEXT NOT NULL,
    source_reference TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fiqh Table
CREATE TABLE public.fiqh (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    examples TEXT,
    source_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Seerah Table
CREATE TABLE public.seerah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_title TEXT NOT NULL,
    event_date TEXT,
    description TEXT NOT NULL,
    media_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Beginner Content Table
CREATE TABLE public.beginner (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('article', 'video')),
    content_link TEXT NOT NULL,
    short_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Favorites Table
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Will reference auth.users later
    content_type TEXT NOT NULL CHECK (content_type IN ('quran', 'hadith', 'fiqh', 'seerah', 'beginner')),
    content_id UUID NOT NULL,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: user_id foreign key constraint must be added after setting up Supabase Auth.
-- ALTER TABLE public.favorites ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security (RLS) on all public content tables
ALTER TABLE public.quran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiqh ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seerah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beginner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users for educational content
CREATE POLICY "Allow public read access to quran" ON public.quran FOR SELECT USING (true);
CREATE POLICY "Allow public read access to hadith" ON public.hadith FOR SELECT USING (true);
CREATE POLICY "Allow public read access to fiqh" ON public.fiqh FOR SELECT USING (true);
CREATE POLICY "Allow public read access to seerah" ON public.seerah FOR SELECT USING (true);
CREATE POLICY "Allow public read access to beginner" ON public.beginner FOR SELECT USING (true);

-- Allow authenticated users to manage their own favorites
CREATE POLICY "Allow users to read their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);
