// بيانات تجريبية للاستخدام في حال فشل السيرفر أو غياب قاعدة البيانات
const MOCK_HADITHS = [
    { id: 101, hadith_text: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.", narrator: "عمر بن الخطاب", book_name: "صحيح البخاري", grade: "صحيح", category: "الإيمان والنوايا" },
    { id: 102, hadith_text: "الدِّينُ النَّصِيحَةُ.", narrator: "تميم الداري", book_name: "صحيح مسلم", grade: "صحيح", category: "الأخلاق وحقوق المسلم" },
    { id: 103, hadith_text: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ.", narrator: "معاوية بن أبي سفيان", book_name: "صحيح البخاري", grade: "صحيح", category: "العلم" }
];

// جلب جميع تصنيفات الأحاديث
exports.getAllCategories = async (req, res) => {
    try {
        const { data, error } = await supabase.from('hadiths').select('category');
        if (error) throw error;
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        res.json(uniqueCategories);
    } catch (err) {
        console.warn('Backend: Using mock categories');
        res.json(["الإيمان والنوايا", "الأخلاق وحقوق المسلم", "العلم"]);
    }
};

// جلب جميع كتب الأحاديث
exports.getAllBooks = async (req, res) => {
    try {
        const { data, error } = await supabase.from('hadiths').select('book_name');
        if (error) throw error;
        const uniqueBooks = [...new Set(data.map(item => item.book_name))];
        res.json(uniqueBooks);
    } catch (err) {
        console.warn('Backend: Using mock books');
        res.json(["صحيح البخاري", "صحيح مسلم"]);
    }
};

const KnowledgeService = require('../services/knowledgeService');

// جلب الأحاديث بناءً على التصنيف
exports.getHadithsByCategory = async (req, res) => {
    const { category } = req.params;
    const { withRelated } = req.query;

    try {
        const { data, error } = await supabase
            .from('hadiths')
            .select('id, hadith_text, narrator, book_name, grade')
            .eq('category', category);

        if (error) throw error;
        
        // ... (existing logic for enrichedData)
        if (withRelated === 'true' && data.length > 0) {
            const enrichedData = await Promise.all(data.map(async (hadith) => {
                const related = await KnowledgeService.getRelatedEntities(hadith.id, 'hadith');
                return { ...hadith, related };
            }));
            return res.json(enrichedData);
        }

        res.json(data);
    } catch (err) {
        console.warn(`Backend: Using mock hadiths for ${category}`);
        const filteredMock = MOCK_HADITHS.filter(h => h.category === category);
        res.json(filteredMock);
    }
};
