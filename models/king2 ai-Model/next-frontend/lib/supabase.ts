// =============================================================================
// KING2 AI — Supabase Client (Server-Only)
// =============================================================================
// - يستخدم خدمة Supabase للـ database من جهة الخادم فقط
// - محمي بـ 'server-only' لمنع تسرب service key للعميل
// - يتحقق من صحة المتغيرات البيئية عند بدء التشغيل
// =============================================================================

/**
 * @fileoverview
 * هذا الملف يُصدّر عميل Supabase موثّقاً بمفتاح الخدمة (service_role key).
 * لا يمكن استيراده من مكوّنات العميل (Client Components) نهائياً.
 *
 * لماذا 'server-only'؟
 * --------------------------------------------------
 * تمنع Next.js استيراد هذا الملف من أي كود يُنفَّذ في المتصفح.
 * هذا يضمن عدم تسريب SUPABASE_SERVICE_KEY أبداً إلى العميل.
 * أي محاولة استيراده من Client Component ستُسبّب خطأ في البناء (build error).
 */
import 'server-only';

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment Validation
// ---------------------------------------------------------------------------

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value === 'your_api_key_here' || value === 'your_supabase_key_here') {
    throw new Error(
      `❌ المتغير البيئي "${name}" غير مضبوط.
      
      يرجى ضبطه في ملف .env.local كالتالي:
      ${name}=القيمة_الحقيقية
      
      إذا كنت لا تستخدم Supabase، يمكن تعطيل قاعدة البيانات بإزالة
      أي استيراد من هذا الملف في كود التطبيق.`
    );
  }
  return value;
}

const supabaseUrl: string = getRequiredEnv('SUPABASE_URL');
const supabaseServiceKey: string = getRequiredEnv('SUPABASE_SERVICE_KEY');

// ---------------------------------------------------------------------------
// Client Instance
// ---------------------------------------------------------------------------

/**
 * عميل Supabase آمن للاستخدام من جهة الخادم فقط
 *
 * @example
 * import { supabase } from '@/lib/supabase';
 * const { data } = await supabase.from('users').select('*');
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    /**
     * تعطيل autoRefreshToken لأن Service Role لا يحتاج إلى تجديد التوكن
     * (هذا الحساب فائق الصلاحيات ولا يخضع لمصادقة المستخدمين)
     */
    autoRefreshToken: false,
    /**
     * تعطيل persistSession لأن Service Role لا يستخدم جلسات متصفح
     */
    persistSession: false,
    /**
     * تأكيد عدم استخدام التخزين المحلي
     */
    detectSessionInUrl: false,
  },
  /**
   * رفع مهلة الطلب لتجنب انتهاء المهلة مع الاستعلامات الكبيرة
   */
  global: {
    fetch: (url, opts) =>
      fetch(url, { ...opts, signal: AbortSignal.timeout?.(10000) ?? opts?.signal }),
  },
} as Parameters<typeof createClient>[2]);

/**
 * تصدير افتراضي للتوافق مع الاستيرادات القديمة
 *
 * @deprecated استخدم الاستيراد المُسمّى: `import { supabase } from '@/lib/supabase'`
 */
export default supabase;
