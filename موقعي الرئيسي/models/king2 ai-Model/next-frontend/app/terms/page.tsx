import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="mb-12 text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-[#D4AF37]">
            KING2 AI
          </span>
          <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
            شروط الاستخدام
          </h1>
          <p className="mt-4 text-sm text-zinc-500">آخر تحديث: مايو 2026</p>
        </div>

        <div className="space-y-8 leading-relaxed text-zinc-300">
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">1. قبول الشروط</h2>
            <p>
              باستخدامك لمنصة KING2 AI فأنت توافق على هذه الشروط وعلى سياسة
              الخصوصية. إذا لم توافق على أي جزء منها، يرجى عدم استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">2. الحساب والأمان</h2>
            <p>
              أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك وعن كل
              نشاط يحدث داخل حسابك. يجب استخدام بريد إلكتروني صحيح وكلمة مرور
              آمنة عند إنشاء الحساب.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">3. الاستخدام المقبول</h2>
            <p>
              يُمنع استخدام المنصة في أنشطة غير قانونية، أو محاولات إساءة
              استخدام الخدمات، أو رفع محتوى ينتهك حقوق الآخرين أو خصوصيتهم.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">4. المحتوى والبيانات</h2>
            <p>
              تبقى ملكية المحتوى الذي تدخله أو ترفعه لك، مع منح KING2 AI الإذن
              اللازم لمعالجة هذا المحتوى بهدف تقديم الخدمة وتحسين التجربة.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">5. حدود المسؤولية</h2>
            <p>
              تقدم المنصة أدوات ذكاء اصطناعي للمساعدة والإنتاجية، ولا تُعد
              مخرجاتها بديلاً عن المشورة المهنية المتخصصة في المجالات الحساسة.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">6. التحديثات</h2>
            <p>
              قد نقوم بتحديث هذه الشروط عند الحاجة. استمرار استخدامك للمنصة بعد
              نشر التحديثات يعني قبولك للشروط المعدلة.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-8 text-center">
          <Link href="/auth/signin" className="text-[#D4AF37] hover:underline">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
