-- =========================================
-- إنشاء قاعدة البيانات
-- =========================================
CREATE DATABASE IF NOT EXISTS islamic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE islamic_db;

-- =========================================
-- إنشاء الجداول وتحديد العلاقات (Foreign Keys)
-- =========================================

-- 1. جدول المستخدمين (Users Table)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- الفهارس لتحسين سرعة تسجيل الدخول والبحث بالنظام
    INDEX idx_email_password (email, password_hash)
);

-- 2. جدول المقالات (Articles Table)
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT,
    category VARCHAR(100) NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views_count INT DEFAULT 0,
    -- علاقة مع جدول المستخدمين بمعرفة من هو الناشر
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    -- ఫهارس للبحث والتصفية وجلب أحدث المقالات
    INDEX idx_category (category),
    INDEX idx_published (published_at)
);

-- 3. جدول القرآن الكريم (Quran Table)
CREATE TABLE quran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    surah_number INT NOT NULL,
    surah_name VARCHAR(50) NOT NULL,
    ayah_number INT NOT NULL,
    ayah_text TEXT NOT NULL,
    juz_number INT NOT NULL,
    page_number INT NOT NULL,
    -- الفهارس لتسريع البحث برقم السورة والجزء والصفحة
    INDEX idx_surah (surah_number),
    INDEX idx_juz (juz_number),
    INDEX idx_page (page_number)
);

-- 4. جدول الأحاديث النبوية (Hadiths Table)
CREATE TABLE hadiths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hadith_text TEXT NOT NULL,
    narrator VARCHAR(100) NOT NULL,
    book_name VARCHAR(100) NOT NULL,
    hadith_number INT,
    grade VARCHAR(50) NOT NULL, -- درجة الحديث: صحيح، حسن، ضعيف
    category VARCHAR(100) NOT NULL,
    -- الفهارس لتسريع البحث عن أحاديث كتاب معين وتصنيفها
    INDEX idx_book (book_name),
    INDEX idx_category (category)
);

-- 5. جدول مواقيت الصلاة (Prayer Times Table) - يُفضل استخدامه كـ Cache مؤقت لتقليل الطلبات للـ APIs
CREATE TABLE prayer_times (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    fajr TIME NOT NULL,
    dhuhr TIME NOT NULL,
    asr TIME NOT NULL,
    maghrib TIME NOT NULL,
    isha TIME NOT NULL,
    -- منع الإدخال المكرر لنفس المدينة في نفس اليوم
    UNIQUE KEY unique_city_date (city, country, date),
    -- الفهارس حسب التاريخ والمدينة
    INDEX idx_city_date (city, date)
);

-- 6. جدول الأذكار (Azkar Table)
CREATE TABLE azkar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zekr_text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- أذكار الصباح، المساء، بعد الصلاة...
    count INT DEFAULT 1, -- العدد المطلوب
    read_time VARCHAR(100) DEFAULT 'في أي وقت', -- وقت القراءة
    fadl TEXT, -- الفضل
    -- الفهارس حسب نوع الذكر (لتسريع الجلب مثل: جلب أذكار الصباح)
    INDEX idx_category (category)
);

-- =========================================
-- إدراج بيانات تجريبية (Seed Data)
-- =========================================

-- مستخدمين (كلمات المرور المشفرة كمثال)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@islamicwebsite.com', '$2b$10$WkX1g.UHQJ/h.fVq84iGe..x.yD3zS7B4c.RzS/kQ2mE/', 'admin'),
('ahmed_user', 'ahmed@example.com', '$2b$10$WkX1g.UHQJ/h.fVq84iGe..x.yD3zS7B4c.RzS/kQ2mE/', 'user');

-- قرآن (مقتطف - الفاتحة)
INSERT INTO quran (surah_number, surah_name, ayah_number, ayah_text, juz_number, page_number) VALUES
(1, 'الفاتحة', 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 1, 1),
(1, 'الفاتحة', 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 1, 1),
(1, 'الفاتحة', 3, 'الرَّحْمَٰنِ الرَّحِيمِ', 1, 1),
(1, 'الفاتحة', 4, 'مَالِكِ يَوْمِ الدِّينِ', 1, 1),
(1, 'الفاتحة', 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 1, 1),
(1, 'الفاتحة', 6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 1, 1),
(1, 'الفاتحة', 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', 1, 1);

-- أحاديث
INSERT INTO hadiths (hadith_text, narrator, book_name, hadith_number, grade, category) VALUES
('إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.', 'عمر بن الخطاب', 'صحيح البخاري', 1, 'صحيح', 'الإيمان والنوايا'),
('الدِّينُ النَّصِيحَةُ.', 'تميم الداري', 'صحيح مسلم', 55, 'صحيح', 'الأخلاق وحقوق المسلم'),
('مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ.', 'معاوية بن أبي سفيان', 'صحيح البخاري', 71, 'صحيح', 'العلم');

-- أذكار
INSERT INTO azkar (zekr_text, category, count, read_time, fadl) VALUES
('أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', 'أذكار الصباح والمساء', 1, 'الصباح والمساء', 'الحفظ من الشيطان'),
('اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ.', 'أذكار الصباح', 1, 'الصباح', 'سيد الاستغفار، من قاله موقنًا به ومات دخل الجنة.'),
('سُبْحَانَ اللَّهِ وبِحَمْدِهِ.', 'أذكار الصباح والمساء', 100, 'الصباح والمساء', 'حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ.');

-- مقالات
INSERT INTO articles (title, content, author_id, category, views_count) VALUES
('أهمية الصلاة في حياة المسلم', 'الصلاة هي الركن الثاني من أركان الإسلام، وهي عماد الدين، وأول ما يُحاسب عليه العبد يوم القيامة...', 1, 'فقه وعبادات', 150),
('فضل قراءة القرآن', 'لقراءة القرآن فضل عظيم، فبكل حرف حسنة، والحسنة بعشر أمثالها، كما أنه شفاء للصدور ونور للدروب...', 1, 'القرآن وعلومه', 320);

-- مواقيت الصلاة (مثال توضيحي لمدينة مكة المكرمة)
INSERT INTO prayer_times (city, country, date, fajr, dhuhr, asr, maghrib, isha) VALUES
('Mecca', 'Saudi Arabia', '2026-03-01', '05:20:00', '12:30:00', '15:50:00', '18:25:00', '19:55:00');

-- =========================================
-- استعلامات SQL الجاهزة (Common Queries)
-- =========================================

-- جلب جميع آيات سورة معينة (مثل سورة الفاتحة / السورة رقم 1)
-- SELECT ayah_number, ayah_text FROM quran WHERE surah_number = 1 ORDER BY ayah_number ASC;

-- جلب الأحاديث من كتاب معين (مثل صحيح البخاري)
-- SELECT hadith_text, narrator, grade FROM hadiths WHERE book_name = 'صحيح البخاري';

-- جلب مقالات قسم معين مع اسم المؤلف (Join)
-- SELECT a.title, a.content, u.username AS author_name, a.published_at 
-- FROM articles a 
-- JOIN users u ON a.author_id = u.id 
-- WHERE a.category = 'القرآن وعلومه' 
-- ORDER BY a.published_at DESC;

-- جلب أذكار الصباح فقط
-- SELECT zekr_text, count, fadl FROM azkar WHERE category LIKE '%الصباح%';

-- جلب مواقيت الصلاة لمدينة معينة في تاريخ معين
-- SELECT fajr, dhuhr, asr, maghrib, isha FROM prayer_times WHERE city = 'Mecca' AND date = '2026-03-01';

-- تحديث عدد مشاهدات مقال معين
-- UPDATE articles SET views_count = views_count + 1 WHERE id = 1;

-- التحقق من صحة البريد الإلكتروني (لتسجيل الدخول)
-- SELECT id, username, password_hash, role FROM users WHERE email = 'admin@islamicwebsite.com';
