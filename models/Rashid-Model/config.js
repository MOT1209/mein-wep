// مفاتيح API - منفصلة للسماح بتغييرها بسهولة
// ملاحظة: يجب إنشاء backend حقيقي لحماية هذه المفاتيح في الإنتاج

const API_KEYS = {
    // Gemini API Key - Provided by user
    gemini: 'YOUR_GEMINI_API_KEY_HERE',
    
    // OpenRouter API - للترجمة وتوليد الصور
    openRouter: 'YOUR_OPENROUTER_API_KEY_HERE',
    
    // Pexels API - لفيديو الخلفية
    pexels: 'YOUR_PEXELS_API_KEY_HERE',
    
    // Supabase - قاعدة البيانات
    supabase: {
        url: 'YOUR_SUPABASE_URL_HERE',
        key: 'YOUR_SUPABASE_KEY_HERE'
    }
};

// حفظ المفاتيح في localStorage للاستخدام
function initAPIKeys() {
    if (!localStorage.getItem('gemini_api_key')) {
        localStorage.setItem('gemini_api_key', API_KEYS.gemini);
    }
}

// دالة للحصول على مفتاح Gemini
function getGeminiKey() {
    return localStorage.getItem('gemini_api_key') || API_KEYS.gemini;
}