// مفاتيح/إعدادات API — منفصلة للسماح بتغييرها بسهولة
//
// 🔒 الأمان: لا مفاتيح في client-side. راشد-كلاو يستدعي بروكسي Vercel
// (/api/gemini) الذي يبقي GEMINI_API_KEY على السيرفر — same pattern as
// js/gemini-config.js of the main site.
const GEMINI_PROXY_URL = '/api/gemini';