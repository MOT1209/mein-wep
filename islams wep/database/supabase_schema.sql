-- =========================================
-- إنشاء الجداول لـ Supabase (PostgreSQL)
-- =========================================

-- 1. جدول المستخدمين (Users Table)
-- يفضل استخدام نظام Auth الخاص بـ Supabase (auth.users)
-- لكن سنقوم بإنشاء جدول عام كمثال حسب طلبك الأساسي، أو نربطه بـ auth
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- في حالة استخدام Auth المدمج لـ Supabase يمكن الاستغناء عن هذا
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول المقالات (Articles Table)
CREATE TABLE public.articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    views_count INTEGER DEFAULT 0
);

-- 3. جدول القرآن الكريم (Quran Table)
CREATE TABLE public.quran (
    id SERIAL PRIMARY KEY,
    surah_number INTEGER NOT NULL,
    surah_name VARCHAR(50) NOT NULL,
    ayah_number INTEGER NOT NULL,
    ayah_text TEXT NOT NULL,
    juz_number INTEGER NOT NULL,
    page_number INTEGER NOT NULL
);

-- 4. جدول الأحاديث النبوية (Hadiths Table)
CREATE TABLE public.hadiths (
    id SERIAL PRIMARY KEY,
    hadith_text TEXT NOT NULL,
    narrator VARCHAR(100) NOT NULL,
    book_name VARCHAR(100) NOT NULL,
    hadith_number INTEGER,
    grade VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL
);

-- 5. جدول الأذكار (Azkar Table)
CREATE TABLE public.azkar (
    id SERIAL PRIMARY KEY,
    zekr_text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    count INTEGER DEFAULT 1,
    read_time VARCHAR(100) DEFAULT 'في أي وقت',
    fadl TEXT
);

-- =========================================
-- إدراج بيانات تجريبية (Seed Data)
-- =========================================

INSERT INTO public.users (username, email, password_hash, role) VALUES 
('admin', 'admin@islamicwebsite.com', 'hashed_pass', 'admin'),
('ahmed_user', 'ahmed@example.com', 'hashed_pass', 'user');

INSERT INTO public.quran (surah_number, surah_name, ayah_number, ayah_text, juz_number, page_number) VALUES
(1, 'الفاتحة', 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 1, 1),
(1, 'الفاتحة', 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 1, 1),
(1, 'الفاتحة', 3, 'الرَّحْمَٰنِ الرَّحِيمِ', 1, 1),
(1, 'الفاتحة', 4, 'مَالِكِ يَوْمِ الدِّينِ', 1, 1),
(1, 'الفاتحة', 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 1, 1),
(1, 'الفاتحة', 6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 1, 1),
(1, 'الفاتحة', 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', 1, 1);

INSERT INTO public.hadiths (hadith_text, narrator, book_name, hadith_number, grade, category) VALUES
('إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.', 'عمر بن الخطاب', 'صحيح البخاري', 1, 'صحيح', 'الإيمان والنوايا'),
('الدِّينُ النَّصِيحَةُ.', 'تميم الداري', 'صحيح مسلم', 55, 'صحيح', 'الأخلاق وحقوق المسلم'),
('مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ.', 'معاوية بن أبي سفيان', 'صحيح البخاري', 71, 'صحيح', 'العلم');

INSERT INTO public.azkar (zekr_text, category, count, read_time, fadl) VALUES
('أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', 'أذكار الصباح والمساء', 1, 'الصباح والمساء', 'الحفظ من الشيطان'),
('اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ.', 'أذكار الصباح', 1, 'الصباح', 'سيد الاستغفار، من قاله موقنًا به ومات دخل الجنة.'),
('سُبْحَانَ اللَّهِ وبِحَمْدِهِ.', 'أذكار الصباح والمساء', 100, 'الصباح والمساء', 'حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ.');

INSERT INTO public.articles (title, content, author_id, category, views_count) VALUES
('أهمية الصلاة في حياة المسلم', 'الصلاة هي الركن الثاني من أركان الإسلام، وهي عماد الدين، وأول ما يُحاسب عليه العبد يوم القيامة...', 1, 'فقه وعبادات', 150),
('فضل قراءة القرآن', 'لقراءة القرآن فضل عظيم، فبكل حرف حسنة، والحسنة بعشر أمثالها، كما أنه شفاء للصدور ونور للدروب...', 1, 'القرآن وعلومه', 320);
