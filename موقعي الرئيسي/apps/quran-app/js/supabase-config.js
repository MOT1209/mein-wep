// ==================== Quran Pro - Supabase Configuration ====================
// يتصل بنفس قاعدة بيانات الموقع الرئيسي

(function() {
    'use strict';
    
    const SUPABASE_URL = 'https://kcltollasghlvuoxvjqa.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbHRvbGxhc2dobHZ1b3h2anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODI5NDksImV4cCI6MjA5Njg1ODk0OX0.w-op2d4THYCrKjql9t1j7BiBZM2krDEkw-vdOwFzXFE';
    
    if (typeof window !== 'undefined' && window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Quran Pro: Supabase connected');
    } else {
        console.warn('⚠️ Quran Pro: Supabase library not loaded');
    }
})();
