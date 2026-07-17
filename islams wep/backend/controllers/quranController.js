const supabase = require('../db');
const KnowledgeService = require('../services/knowledgeService');

// بيانات تجريبية (Mock Data) للنظام في حال تعطل القاعدة
const MOCK_SURAHS = [
    { surah_number: 1, surah_name: "الفاتحة", english_name: "Al-Fatihah", ayahs_count: 7, revelation_type: "مكية" },
    { surah_number: 2, surah_name: "البقرة", english_name: "Al-Baqarah", ayahs_count: 286, revelation_type: "مدنية" },
    { surah_number: 3, surah_name: "آل عمران", english_name: "Al-Imran", ayahs_count: 200, revelation_type: "مدنية" }
];

const MOCK_AYAHS = {
    1: [
        { id: 1, ayah_number: 1, ayah_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
        { id: 2, ayah_number: 2, ayah_text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
        { id: 3, ayah_number: 3, ayah_text: "الرَّحْمَٰنِ الرَّحِيمِ" },
        { id: 4, ayah_number: 4, ayah_text: "مَالِكِ يَوْمِ الدِّينِ" },
        { id: 5, ayah_number: 5, ayah_text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
        { id: 6, ayah_number: 6, ayah_text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
        { id: 7, ayah_number: 7, ayah_text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ" }
    ]
};

// الحصول على قائمة بجميع سور القرآن
exports.getAllSurahs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('quran')
            .select('surah_number, surah_name');

        if (error || !data || data.length === 0) throw new Error('No local data');

        const uniqueSurahsMap = new Map();
        data.forEach(item => {
            if (!uniqueSurahsMap.has(item.surah_number)) {
                uniqueSurahsMap.set(item.surah_number, item);
            }
        });

        const uniqueSurahs = Array.from(uniqueSurahsMap.values()).sort((a, b) => a.surah_number - b.surah_number);
        res.json(uniqueSurahs);
    } catch (err) {
        console.warn('Backend: Using mock surah list');
        res.json(MOCK_SURAHS);
    }
};

// الحصول على آيات سورة محددة
exports.getSurahAyahs = async (req, res) => {
    const { id } = req.params;
    const { withRelated } = req.query;

    try {
        const { data, error } = await supabase
            .from('quran')
            .select('id, ayah_number, ayah_text')
            .eq('surah_number', id)
            .order('ayah_number', { ascending: true });

        if (error || !data || data.length === 0) throw new Error('No ayahs found');

        // إذا طلب المستخدم الروابط المتعلقة
        if (withRelated === 'true') {
            const enrichedData = await Promise.all(data.map(async (ayah) => {
                const related = await KnowledgeService.getRelatedEntities(ayah.id, 'ayah');
                return { ...ayah, related };
            }));
            return res.json(enrichedData);
        }

        res.json(data);
    } catch (err) {
        console.warn(`Backend: Using mock ayahs for surah ${id}`);
        res.json(MOCK_AYAHS[id] || [{ id: 0, ayah_number: 1, ayah_text: "يرجى الانتظار، جاري التحميل من مصدر خارجي..." }]);
    }
};

// الحصول على تفسير آية محددة
exports.getSurahAyahTafsir = async (req, res) => {
    const { surah, ayah } = req.params;
    try {
        // نستخدم تفسير الجلالين كمصدر سريع من Alquran API
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.jalalayn`);
        const data = await response.json();

        if (data.code === 200) {
            res.json({
                text: data.data.text,
                edition: data.data.edition.name
            });
        } else {
            throw new Error('Tafsir not found');
        }
    } catch (err) {
        res.status(500).json({ error: 'تعذر جلب التفسير حالياً' });
    }
};
