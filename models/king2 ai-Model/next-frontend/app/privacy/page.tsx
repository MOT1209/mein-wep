'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0C10' }}>
      <div className="px-6 py-24 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">الخصوصية والأمان</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">سياسة الخصوصية</h1>
          <p className="text-zinc-500 text-sm mt-4">آخر تحديث: مايو 2026</p>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. المقدمة</h2>
            <p>
              مرحباً بك في KING2 AI. خصوصيتك وأمان بياناتك هما أساس عملنا. 
              تصف هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام منصتنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. البيانات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>معلومات الحساب: الاسم، البريد الإلكتروني، صورة الملف الشخصي</li>
              <li>بيانات الاستخدام: المحادثات، الاستعلامات، تفضيلات المستخدم</li>
              <li>بيانات تقنية: عنوان IP، نوع المتصفح، نظام التشغيل</li>
              <li>ملفات الوسائط: الصور والفيديوهات التي ترفعها للمونتاج</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. كيف نستخدم بياناتك</h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>تقديم خدمة الذكاء الاصطناعي وتحسين أدائها</li>
              <li>تدريب وتحسين نماذج الذاكرة (RAG) لتناسب احتياجاتك</li>
              <li>تحليل الاستخدام لتطوير المنصة</li>
              <li>التواصل معك بخصوص التحديثات والعروض (بموافقتك)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. التشفير والأمان</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <p className="text-[#D4AF37] font-bold mb-1">AES-256</p>
                <p className="text-sm text-zinc-500">تشفير كامل للبيانات المخزنة</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <p className="text-[#D4AF37] font-bold mb-1">TLS 1.3</p>
                <p className="text-sm text-zinc-500">تشفير جميع الاتصالات</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <p className="text-[#D4AF37] font-bold mb-1">GDPR</p>
                <p className="text-sm text-zinc-500">متوافق مع اللائحة الأوروبية</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <p className="text-[#D4AF37] font-bold mb-1">Zero-Knowledge</p>
                <p className="text-sm text-zinc-500">المعرفة الصفرية للبيانات الحساسة</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. الاحتفاظ بالبيانات</h2>
            <p>
              نحتفظ ببياناتك طوال فترة نشاط حسابك. عند حذف حسابك، نحذف جميع بياناتك الشخصية 
              خلال 30 يوماً. قد نحتفظ ببعض البيانات المجهولة لأغراض إحصائية.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. حقوقك</h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>حق الوصول إلى جميع بياناتك الشخصية</li>
              <li>حق تصحيح أو تحديث بياناتك</li>
              <li>حق حذف حسابك وبياناتك (&quot;الحق في النسيان&quot;)</li>
              <li>حق سحب الموافقة على معالجة البيانات</li>
              <li>حق تصدير بياناتك (Data Portability)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. الاتصال بنا</h2>
            <p>
              لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني:
              <a href="mailto:privacy@king2.ai" className="text-[#D4AF37] hover:underline mr-1">privacy@king2.ai</a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800/50 text-center">
          <p className="text-zinc-600 text-sm">
            © 2026 KING2 AI — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}