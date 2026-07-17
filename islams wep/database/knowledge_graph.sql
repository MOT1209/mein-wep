-- ===============================================
-- بنية قاعدة البيانات للمنصة المعرفية الإسلامية (Knowledge Graph)
-- ===============================================

-- 1. جدول المواضيع (Topics / Taxonomy)
-- يمثل المفاهيم المركزية للربط (مثل: الصبر، الزكاة، بر الوالدين)
CREATE TABLE IF NOT EXISTS public.topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- (عقيدة، فقه، أخلاق، إلخ)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. أنواع الكيانات (Entity Types)
-- (آية، حديث، مقال، ذكر)
CREATE TABLE IF NOT EXISTS public.entity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO public.entity_types (name) VALUES ('ayah'), ('hadith'), ('article'), ('zekr') 
ON CONFLICT (name) DO NOTHING;

-- 3. روابط الكيانات بالمواضيع (Entity to Topic Links)
-- يربط أي شيء (آية أو حديث) بموضوع معين
CREATE TABLE IF NOT EXISTS public.entity_topic_links (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER NOT NULL, -- معرف السجل في جدوله الأصلي
    entity_type_id INTEGER REFERENCES public.entity_types(id),
    topic_id INTEGER REFERENCES public.topics(id) ON DELETE CASCADE,
    relevance_score INTEGER DEFAULT 5, -- درجة الصلة بالموضوع (1-10)
    UNIQUE(entity_id, entity_type_id, topic_id)
);

-- 4. الروابط المباشرة بين الكيانات (Direct Entity-to-Entity Links)
-- (مثل: هذا الحديث يشرح هذه الآية)
CREATE TABLE IF NOT EXISTS public.entity_links (
    id SERIAL PRIMARY KEY,
    source_entity_id INTEGER NOT NULL,
    source_type_id INTEGER REFERENCES public.entity_types(id),
    target_entity_id INTEGER NOT NULL,
    target_type_id INTEGER REFERENCES public.entity_types(id),
    relation_type VARCHAR(50) DEFAULT 'relates_to', -- (explains, mentions, source_of, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(source_entity_id, source_type_id, target_entity_id, target_type_id)
);

-- 5. جدول التفضيلات المتقدم (Enhanced User Bookmarks)
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    entity_id INTEGER NOT NULL,
    entity_type_id INTEGER REFERENCES public.entity_types(id),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, entity_id, entity_type_id)
);

-- 6. تتبع التقدم والأوراد (User Progress / Habits)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    entity_id INTEGER NOT NULL, -- مثل زكر معين أو الصفحة في القرآن
    entity_type_id INTEGER REFERENCES public.entity_types(id),
    count_completed INTEGER DEFAULT 0,
    last_action_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- بذر بيانات أولية للمواضيع (Seed Data)
-- ===============================================
INSERT INTO public.topics (name, description, category) VALUES 
('الصبر', 'مفهوم الصبر في القرآن والسنة وأنواعه', 'أخلاق'),
('الزكاة', 'أحكام الزكاة والصدقات والحساب المالي', 'فقه'),
('العلم', 'فضل طلب العلم وآداب المتعلمين', 'عام'),
('التوحيد', 'أساس العقيدة الإسلامية وأركان الإيمان', 'عقيدة')
ON CONFLICT (name) DO NOTHING;
