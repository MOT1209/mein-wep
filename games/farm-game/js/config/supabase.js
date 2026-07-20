/**
 * Supabase Configuration for Farm Game
 * يستخدم إعدادات Supabase المشتركة مع الموقع الرئيسي
 */

var GAME = GAME || {};

GAME.config = {
  // استخدام إعدادات Supabase من الموقع الرئيسي
  supabaseUrl: 'https://kcltollasghlvuoxvjqa.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbHRvbGxhc2dobHZ1b3h2anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODI5NDksImV4cCI6MjA5Njg1ODk0OX0.w-op2d4THYCrKjql9t1j7BiBZM2krDEkw-vdOwFzXFE',
  
  // إعدادات إضافية
  autoSaveInterval: 300000, // 5 دقائق
  maxSaveSlots: 10,
  enableRealtime: false, // للعب الجماعي
};

// تصدير للنطاق العام
if (typeof window !== 'undefined') {
  window.GAME_CONFIG = GAME.config;
}
