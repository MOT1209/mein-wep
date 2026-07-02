# Rashid Portfolio — Development Workflow

## المشروع
موقع راشد الشخصي — بورتفوليو، ألعاب، تطبيقات، ذكاء اصطناعي، خزينة معرفة.
- **Vercel**: `https://rashid-wep.vercel.app`
- **Supabase**: للتواصل + تسجيل الدخول
- **Sub-agents**: 15 agent متخصص في `.opencode/agents/`

## الـ 10 خطوات الإجبارية

### 1. Planning
- افهم الطلب بالكامل.
- ضع خطة خطوة بخطوة.
- حدد الملفات المتأثرة قبل التعديل.

### 2. Analysis
- حلل المتطلبات والتبعيات.
- حدد المخاطر والتأثيرات الجانبية.
- اقرأ الملفات المتأثرة أولاً.

### 3. Implementation
- اكتب الكود وفق معايير المشروع.
- اتبع ES Modules، Vanilla JS، CSS custom properties.
- لا تكرر الكود — استخدم الأنماط الموجودة.

### 4. Self Review
- راجع كل تعديل بعد كتابته.
- تحقق من: الأداء، الأمان، التوافق، الأسلوب.
- تأكد من عدم وجود secrets أو keys في الكود.

### 5. Auto Fix
- صلّح أي مشاكل تكتشفها في المراجعة.
- كرر المراجعة حتى ترضى.

### 6. Build & Lint
- إذا كان هناك `build` أو `lint`، شغّله.
- صلّح أي أخطاء.

### 7. TestSprite
- شغّل `npm test` أو `python .testsprite/test3.py` أو أي اختبار موجود.
- اختبر الـ Frontend (Playwright) والـ Backend (HTTP/Supabase).
- انتظر النتائج كاملة.

### 8. Auto Fix Loop
- إذا فشل أي اختبار:
  - حلّل سبب الفشل.
  - صلّح المشكلة.
  - أعد Build + Lint + TestSprite.
  - كرر حتى الكل ناجح.

### 9. Summary
- لخّص العمل:
  - ما الذي تم؟
  - الملفات المعدلة.
  - نتائج الاختبارات.

### 10. Git
- `git add .`
- `git commit -m "وصف مختصر"` (نمط: `type(scope): description`)
- `git push origin main`

## استخدام الـ Sub-agents
- للمهام التخصصية، استخدم الـ agent المناسب من `.opencode/agents/`.
- لا تعمل على code خارج تخصصك دون الرجوع للـ main workflow.
- استشر `code-architect` للتغييرات الهيكلية الكبيرة.

## معايير عامة
- **لا** `innerHTML` مع بيانات المستخدم — استخدم `textContent`.
- **لا** API keys في client-side code دون تشفير.
- **ES Modules** فقط — لا CommonJS.
- **CSS custom properties** للتصميم.
- **Mobile-first** لكل الصفحات.
- **RTL/LTR** Support.
