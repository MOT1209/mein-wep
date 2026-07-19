/**
 * Supabase Configuration for Farm Game
 * 
 * للاستخدام:
 * 1. أنشئ حساباً على supabase.com
 * 2. أنشئ مشروع جديد
 * 3. انسخ URL و anon key
 * 4. ضعهما في ملف .env أو استبدلهما هنا
 */

var GAME = GAME || {};

GAME.config = {
  // استبدل هذه القيم ببيانات مشروعك على Supabase
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
  
  // إعدادات إضافية
  autoSaveInterval: 300000, // 5 دقائق
  maxSaveSlots: 10,
  enableRealtime: false, // للعب الجماعي
};

// تصدير للنطاق العام
if (typeof window !== 'undefined') {
  window.GAME_CONFIG = GAME.config;
}
