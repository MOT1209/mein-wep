# Rashid Portfolio — CLAUDE.md

> آخر تحديث: 2026-11-03 — الأوامر هنا مُتحقق منها فعلياً على هذه النسخة من المستودع.

## ⛔ القاعدة الذهبية — اسأل قبل أي عمل (Ask Before Doing)

1. **ممنوع** البدء بأي عمل — تعديل، بناء، كوميت، push، حذف — قبل أن تسأل المستخدم وتفهم منه ماذا يفعل بالضبط.
2. بعد الفهم، لخّص ما ستفعله في 1–3 أسطر دقيقة وانتظر موافقته الصريحة، ثم نفّذ.
3. بعد الموافقة: آلية التنفيذ التقنية قرارك أنت (أدوات، ترتيب، تفاصيل) — لكن الخطة وماهية العمل يحددهما المستخدم أولاً.
4. إن كان الطلب غامضاً أو بنيته أكثر من تفسير — اسأل مرة أخرى لا تخمّن.

## المشروع (Project)

موقع راشد الشخصي — بورتفوليو + ألعاب متصفح + تطبيقات PWA + مساعد ذكاء اصطناعي + خزينة معرفة.

- **النشر الأساسي**: `https://rashid-wep.vercel.app` — **كل push إلى `main` ينشر في الإنتاج فوراً.**
- **Fallback**: GitHub Pages ثابت (بلا serverless — ميزات `api/` لا تعمل هناك).
- **Backend**: Vercel Serverless في `api/` (5 endpoints: contact, evaluate, gemini, github, rss) + Supabase.

## أوامر البناء والتحقق (Build & Verify)

| الأمر | وظيفته |
|---|---|
| `npm run build` | Eleventy → `dist/` — ينسخ **الملفات المتتبعة في Git فقط** |
| `npm run verify` | بوابة سطح URL: تطابق `git ls-files` ↔ `dist/` — **يجب أن تمر (PARITY OK) قبل أي كوميت يتضمّن ملفات موقع** |
| `npm start` | `eleventy --serve` على `localhost:8080` |
| `node --check <file.js>` | فحص نحوي سريع لأي JS معدّل |

- **لا يوجد `npm test`** في هذا المشروع — لا تستدعِه.
- `eleventy.config.mjs` و`scripts/check-url-surface.mjs` ملتصقان منطقياً: أي تغيير في قوائم NOT_SERVED/VERCEL_IGNORE في واحد يُرَدّ في الآخر (وأيضاً في `.gitignore` + `.vercelignore`).
- لأسماء الملفات العربية في `git ls-files` على ويندوز: استخدم `git -c core.quotepath=false ls-files` (بدونها تُهرّب الأسماء octal ولا تطابق أسماء dist).

## الـ 10 خطوات الإجبارية

### 1. Ask & Understand
- طبّق القاعدة الذهبية (§0) قبل أي شيء آخر — بما فيها العمل "الواضح".

### 2. Planning
- ضع خطة خطوة بخطوة.
- حدد الملفات المتأثرة قبل التعديل.

### 3. Analysis
- اقرأ الملفات المتأثرة فعلياً قبل الكتابة.
- حدد المخاطر: التأثيرات الجانبية، الملفات المشتركة، الحساسية الإنتاجية.

### 4. Implementation
- اتبع معايير المشروع (§ معايير عامة).
- التزم أسلوب الكود المحيط — لا تُعرِّف أنماطاً موازية.

### 5. Self Review + Auto Fix
- راجع كل تعديل فور كتابته: أداء، أمان، توافق، أسلوب.
- صلّح ما تجده وأعد المراجعة حتى الرضا.
- تأكد: لا secrets، لا مفاتيح، لا placeholders (`YOUR_KEY_HERE`) في كود سيُتتبّع.

### 6. Build & Verify (البوابة الإلزامية)
```
npm run build       # لا أخطاء
npm run verify      # URL-surface PARITY OK
node --check        # على كل .js عدّلته
```
- فشل أي منها ⇒ لا انتقال للخطوة التالية.

### 7. TestSprite (اختياري فقط)
- لا يُشغَّل إلا إذا طلبه المستخدم **صراحةً** في ذلك الطلب.
- السكربتات في `.testsprite/` محلية على القرص (غير متتبعة) وتحتاج مفتاح API من TestSprite.

### 8. Auto Fix Loop
- عند فشل build/verify: حلل الخطأ من **جذره — خصوصاً إذا قدّمنا تغييراً حديثاً بنيته**. مثال واقعي: فشل verify بسبب أسماء ملفات عربية (هُرُب quotepath) أو ملفات متتبعة محذوفة.

### 9. Summary
- لخّص: ماذا تم، الملفات المعدّلة، نتائج build/verify.

### 10. Git — البروتوكول

> ⚠️ **ممنوع `git add .` في هذا المستودع.** جذر المستودع هو جذر النشر على Vercel،
> ويحتوي مجلدات مشاريع أخرى وملفات أسرار غير متتبَّعة. أمر `git add .` واحد
> سبق أن كان كفيلاً بمسح الموقع الحيّ ورفع مفتاح API إلى مستودع عام.

```
git status --short                      # راجع الحالة أولاً
git ls-files -d                         # يجب أن يكون فارغاً (استعادة: git ls-files -d -z | xargs -0 git restore --)
git add <المسارات الصريحة التي عدّلتها فعلاً>
git diff --cached                       # راجع ما سيُكومت
git commit -m "type(scope): وصف عربي"
# ثم: اطلب موافقة المستخدم قبل أي push (§ قواعد النشر)
git push origin main
```

- نص الرسالة: `type(scope): وصف عربي` — مثل `fix(admin): إصلاح التحويل بعد الدخول`.
- أنواع شائعة: `feat fix chore docs refactor style ci`.

## قواعد الأمان (Security Rules)

- **كل استدعاء LLM يمر عبر بروكسي Vercel** (`/api/gemini`) — المفتاح يعيش في متغير بيئة Vercel فقط. ممنوع استدعاء `generativelanguage.googleapis.com` مباشرة من متصفح بمفتاح.
- **لا مفاتيح/tokens في أي ملف client-side** — `js/`, `models/*/script.js`, أي HTML. لا حتى placeholders ستُرى علناً.
- **CORS**: القائمة البيضاء `ALLOWED_ORIGINS` داخل كل ملف `api/*.js` — أضف المنفذ المحلي الجديد صراحة (`localhost:8080/127.0.0.1:8080` لخدمة eleventy موجودة الآن).
- **CSP**: أي نطاق خارجي جديد يستدعيه الموقع يجب أن يُضاف إلى `connect-src` في `vercel.json` — وإلا ستُحجب الطلبات في الإنتاج بصمت.
- بيانات المستخدم → `textContent`/`escapeHtml` — لا `innerHTML` أبداً مع إدخال المستخدم.
- **Rate limiting** في `api/` بالذاكرة (لكل isolate) — قصور موثّق في الكود؛ الترقية المستقبلية: Upstash Redis.

## قواعد النشر (Deployment Rules)

- `git push origin main` = نشر إنتاج فوري — **إلزامي طلب موافقة المستخدم قبل كل commit+push.**
- قبل أي push: `npm run build` ناجح + `npm run verify` ناجح + `git diff --cached` مراجَع + المستخدم وافق.
- **متغيرات البيئة تعيش في لوحة Vercel فقط** (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`...) — لا تُكتب في المستودع إطلاقاً.
- **قاعدة الثلاث أماكن**: عند إضافة مجلد أدوات وكلاء جديد سجّله في الثلاثة معاً: `.gitignore` + `.vercelignore` + فلاتر `eleventy.config.mjs` (NOT_SERVED وVERCEL_IGNORE — ومتماثلتها في `scripts/check-url-surface.mjs`).

## بنية الموقع الحالية (Real Folder Map — لا تخترع مجلدات)

```
root/
├── صفحات جذر: index, about, contact, privacy, terms, quran, learning, devos, downloads, 404, offline (.html)
├── games/      → farm-game • kingcraft-game • rust-game • index.html
│                 (games/kingcraft1/ غير متتبعة — قرار المستخدم معلّق، لا تلمسها دون سؤاله)
├── apps/       → calculator-app • chat-app • quiz-app
├── models/     → Rashid-Model (chat عبر /api/gemini)
├── admin/      → login.html • dashboard.html
├── vault/      → api • archive • code • docs • media • prompts
├── api/        → serverless: contact, evaluate, gemini, github, rss (.js)
├── src/        → css/ + js/modules/ (~17 module: theme, projects, vault, supabase, navbar, ...)
├── css/ • js/ • images/ • scripts/ (أدوات بناء/تحقق)
├── مجلدات محتوى/مشاريع متتبعة: linguaverse • denkmalen • okf • blog • audio • apks • agents • tools • mcp • docs • notebooks • _data • .well-known
├── Supabase: SUPABASE_*.sql (7 مخططات قاعدة البيانات) + ملفات إعداد: vercel.json, render.yaml, eleventy.config.mjs
└── dist/ (gitignored — ناتج بناء فقط)

أدوات وكلاء — على القرص فقط، غير متتبعة في Git:
.claude/ • .opencode/ • .agents/ • .testsprite/ • .pi/  (≈2169 ملفاً فكّ تتبّعها 2026-11)
```

- أسماء ملفات جديدة: **ASCII فقط** — الأسماء العربية سببت فشل بناء فعلياً (هرُب أسماء quotepath + عدم تطابق اسم dist مع اسم fs).

## استخدام الـ Sub-agents وSkills

- الأدوات في `.claude/` و`.opencode/` و`.agents/` تعمل **محلياً على القرص** (غير متتبعة في Git عمداً).
- لا "تصلح" غير وجودها في المستودع بإعادة إضافتها إلى Git — هذا خطأ.
- للمهام التخصصية استخدم agent المناسب من `.opencode/agents/`.
- استشر `code-architect` للتغييرات الهيكلية الكبيرة.

## معايير عامة (Coding Standards)

- **ES Modules** فقط في الكود الجديد — لا CommonJS. (استثناء: صفحات كلاسيكية قديمة مثل `models/Rashid-Model` تتشارك global scope مع `config.js` — حديثها بنفس النمط لا بتحويلها).
- **CSS custom properties** لكل التصميم.
- **Mobile-first** لكل الصفحات، و**RTL/LTR** مدعومان.
- لا تكرّر كوداً — استخدم الأنماط والوحدات الموجودة (خصوصاً `src/js/modules/`).
- **لا مكتبات جديدة** دون حاجة قهرية + موافقة المستخدم — المشروع Vanilla مقصود.
- لغة التوثيق داخل الكود: التعليقات بالعربية حيث تفيد؛ المصطلحات التقنية بالإنجليزية.
