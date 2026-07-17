const supabase = require('../db');

// بيانات تجريبية (Mock Data) لضمان عمل الموقع حتى بدون قاعدة بيانات
const MOCK_AZKAR = [
    { zekr_text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, category: "أذكار الصباح والمساء", fadl: "حطت خطاياه وإن كانت مثل زبد البحر", read_time: "رواه مسلم" },
    { zekr_text: "أستغفر الله", count: 33, category: "أذكار الصلاة", fadl: "من لزم الاستغفار جعل الله له من كل هم فرجاً", read_time: "رواه مسلم" }
];

// جلب جميع تصنيفات الأذكار
exports.getAllCategories = async (req, res) => {
    try {
        const { data, error } = await supabase.from('azkar').select('category');
        if (error) throw error;

        const uniqueCategories = [...new Set(data.map(item => item.category))];
        if (uniqueCategories.length === 0) throw new Error('No categories found');
        res.json(uniqueCategories);
    } catch (err) {
        console.warn('Backend: Using mock azkar categories');
        res.json(["أذكار الصباح والمساء", "أذكار الصلاة", "أذكار النوم والاستيقاظ", "أدعية عامة"]);
    }
};

// جلب الأذكار بناءً على التصنيف المختار
exports.getAzkarByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const { data, error } = await supabase
            .from('azkar')
            .select('zekr_text, count, read_time, fadl')
            .eq('category', category);

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No azkar items');

        res.json(data);
    } catch (err) {
        console.warn(`Backend: Using mock azkar for category: ${category}`);
        const filtered = MOCK_AZKAR.filter(item => item.category === category);
        res.json(filtered.length > 0 ? filtered : MOCK_AZKAR);
    }
};
