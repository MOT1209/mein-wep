# خطة: مراجعة كاملة + إعادة تصميم وتحديث معلومات rashid-wep.vercel.app

## Context
المالك طلب مراجعة كاملة للموقع الحي، لأنه يحتاج إعادة تصميم وتحديث المعلومات.
راجعتُ بناءً محلياً مطابقاً لـ `main` في Chromium. شمل الفحص 11 صفحة بعرض 390px و1440px، ولقطات للوضع الداكن لثلاث منها. وقرأتُ الكود المصدر للصفحات.

ملاحظة: الأيقونات والخطوط الخارجية محجوبة في بيئة الفحص، فلم أحكم عليها.

**الخلاصة:** الهيكل التقني الآن سليم. الصفحات الأساسية (Home وAbout وBlog وDownloads وKing Studio) على نظام واحد ومتجاوبة. المشكلة الحقيقية الآن في ثلاثة أشياء:
1. **المحتوى**: ادعاءات غير دقيقة ومعلومات متضاربة بين الصفحات.
2. **ترتيب الصفحة الرئيسية**: طويلة جداً على الهاتف، 8199px، وصورها غير حقيقية.
3. **صفحات قديمة** بتصميم مختلف وبعضها مكسور.

## ما وجدته (حقائق من الفحص والكود)

### الصفحة الرئيسية (`index.njk`، `src/js/modules/projects.js`)
- قائمة واحدة من 11 بطاقة. على الهاتف تصبح عموداً طويلاً جداً.
- 7 من البطاقات تعرض صورة "terminal" عامة متكررة، لا لقطة حقيقية للمشروع.
- نص تقني ظاهر للزائر: "Loaded from Local System (Offline Mode)".
- **ادعاءات غير دقيقة أو غير متحقق منها:**
  - "Every one is a PWA": غير صحيح. Gem-PRO وMaarifah (Flutter) وKING2 ليست كذلك.
  - "Six installable apps … all open source".
  - شارات "Open Source" على Gem-PRO وislams-wep.
  - أرقام ثابتة في الكود: 15 repos، 13 shipped، 6 Android builds، "Last build 2026-07-14".
- وصف Maarifah وKING2 مكتوب بالعربية داخل صفحة إنجليزية.
- زر المساعد الصوتي البرتقالي يطفو فوق المحتوى، ويتداخل مع شريط الكوكيز على الهاتف.
- ازدواجية: Quran Pro وKingCraft وغيرهما معروضة في الرئيسية من `projects.js` وفي King Studio من `studioCatalog.json`. مصدران للبيانات نفسها، والأوصاف والحالات بدأت تختلف بينهما.

### About (`about.njk`)
- يتعارض مع الرئيسية:
  - الرئيسية: "AI engineer… Germany".
  - About: "Full-Stack | 3D World Builder".
  - About يذكر Next.js وReact كتخصص، بينما الموقع نفسه وأغلب المشاريع vanilla JS.
- "FromLiten" يظهر بلا شرح. لا أعرف ما هو.
- خط زمني 2022–2024 لم أستطع التحقق منه.

### King Studio
- التصميم جيد ومتسق.
- لكن بطاقات التطبيقات والتجارب بلا صور حقيقية: Quiz Master وRashid AI مربعات سوداء فارغة، وCalculator Vault مربع أخضر فقط.

### صفحات قديمة (نظام تصميم مختلف أو مكسورة)
| الصفحة | المشكلة |
|---|---|
| `devos.html` | تخطيط مكسور على الكمبيوتر: بطاقات منهارة ونص مقصوص. محتوى مزيّف: "Gemini 1.5 Flash" و"Lead Architect" وسجلات نظام وهمية. |
| `vault/*` | تصميم داكن قديم، ومعلومات معمارية قديمة: calculator-vault وscript.js. |
| `models/Rashid-Model` ("RashidClaw") | تصميم مختلف بالعربية، ويدّعي توليد صور وفيديو دون تحقق، مع خطأ JS: `API_KEYS already declared`. |
| `quran.html` | تصميم أخضر/ذهبي خاص به، ويبدو أنه يعمل. لا مشكلة عاجلة. |
| `learning.html` | خطأ `supabaseClient`، وقد يكون جزء منه بسبب حجب الشبكة في الفحص. |

### تقنية متبقية
- fallback الخاص بـ FormSubmit في نموذج التواصل محجوب بـ CSP.
- Font Awesome يُحمَّل بأكثر من نسخة.

### نتائج تدقيق المحتوى (وكيل Explore، قراءة الكود)
- **🔴 رسائل التواصل لا تصل للبريد:**
  - CSP في `vercel.json:18` لا يسمح بـ `formsubmit.co`، فالرسائل تُحفظ في جدول Supabase `contact_messages` فقط.
  - مع ذلك تظهر للزائر "Message sent! I'll get back to you soon." (`src/js/main.js:144,171`، `contact-body-script.njk:58`).
- **Quran Pro**: الموقع يدّعي "تفسير، +40 قارئ، بحث، علامات، offline". الصفحة الفعلية `quran.html` تشغّل 6 مقاطع صوتية فقط من Hugging Face.
- **Rashid AI / RashidClaw** لا يعمل:
  - مفاتيح وهمية `YOUR_GEMINI_API_KEY_HERE` في `models/Rashid-Model/script.js` و`config.js`.
  - OpenRouter غير مستخدم.
  - Translate وPexels محجوبان بـ CSP.
  - مع ذلك هو مربوط من الرئيسية والكتالوج و`llms.txt` و`sitemap.xml` و`manifest.json`.
- **أسماء المنتجات بـ 3–5 نسخ لكل منتج.** مثلاً KingCraft = Voxel Realm = KingCraft 3D، وFarm Empire = Farm World 3D = Farm Game 3D = 3D Farm Simulator. اسم التطبيق المثبَّت على Android يختلف عن بطاقة التنزيل.
- **المسمى الوظيفي** يتغير بين الصفحات: "Full-Stack & AI Engineer" و"AI Enthusiast" و"Lead Architect" (devos) و"Junior Software Developer" (`js/rashid-ai-v2.js:202,413`).
  - المساعد يذكر Rust كمهارة.
  - About يذكر Next.js/TypeScript رغم أن العمل الوحيد بـ Next.js هو KING2 الخارجي.
- **"Alking"** في og:description وJSON-LD (`index.njk:18,40`) مشروع غير موجود.
- **"all open source"** يتعارض مع: لا LICENSE في المستودع، وشروط الاستخدام `terms.njk` تمنع النسخ.
- **أرقام لا يمكن أن تكون صحيحة:**
  - repos = `max(public_repos,15)+'+'` (`main.js:193`).
  - shipped = 13 بينما الشبكة 11.
  - خريطة مساهمات GitHub مولّدة بـ `Math.sin` (`src/js/modules/github.js:283`).
- **`/games/kingcraft1/` مُنشَر لكنه مكسور:** يحمّل `/src/main.ts` غير مبني، ويكشف `MASTER_PROMPT.md` و`plan.md`.
- **روابط ميتة:**
  - `okf/*` تشير إلى `/apps/maarifah-web/` و`/apps/quran-app/` و`/apps/`.
  - مراسي `#github`/`#vault` غير موجودة.
  - اختصار `manifest.json` يشير إلى `./#vault`.
- **AdSense يُحمَّل قبل الموافقة** في base.njk وvault والصفحات الأخرى.
- **سياسة الخصوصية ناقصة.** لا تذكر GA4 وSupabase وGemini وHugging Face وAdMob، ولا Impressum، رغم "Based in Germany".
  - رأيي، لا استشارة قانونية: هذا خطر قانوني فعلي في ألمانيا (DSGVO/TMG).
- **المدونة:** لا مقال منذ 4 أشهر، وبعض المقالات تحتوي معلومات أصبحت خاطئة (مثلاً "Cloudflare Worker" وhreflang).

## قرارات المالك (2026-10-18)
- **devos**: يُحذف مع redirect.
- **vault**: يُرحَّل للتصميم الموحد.
- **RashidClaw**: يبقى غير مربوط مع إصلاح أخطائه.
- **quran**: كما هو.
- **Gem-PRO وKING2 وMaarifah وislams-wep**: تبقى كروابط GitHub فقط في الكتالوج، دون ادعاء Open Source إلا إن كان المستودع عاماً فعلاً.
- **زر المساعد الصوتي**: يبقى مع إصلاح التداخل.
- **الهوية**: لا تفضيل. أعتمد العبارة الأكثر استخداماً حالياً: "Full-Stack Developer & AI Engineer · Germany"، وأوحّدها في كل مكان بما فيه المساعد. نعدّلها لاحقاً بسطر واحد في `_data/site.json`.

## النهج المقترح (على مراحل، كل مرحلة PR مستقل)

### المرحلة 0 — أعطال حقيقية (أولوية قصوى، PR صغير)
- رسائل التواصل: إضافة `https://formsubmit.co` إلى `connect-src` في `vercel.json`. بعدها نص "تم الإرسال" يعكس الواقع.
  - إن لم يكن FormSubmit مفعّلاً لبريدك فسيحتاج تأكيداً منك مرة واحدة.
- استثناء `games/kingcraft1/` من النشر عبر `VERCEL_IGNORE` + `check-url-surface.mjs`.
- إزالة "Alking" وخريطة المساهمات الوهمية.
- إصلاح الروابط الميتة في `okf/` و`manifest.json` والمراسي.
- إيقاف تحميل AdSense قبل الموافقة.

### المرحلة A — الحقيقة أولاً (صغيرة، أثر كبير)
- **مصدر بيانات واحد للمشاريع:** الرئيسية تقرأ من `_data/studioCatalog.json` عبر `_data/kingStudio.js`، بدل المصفوفة المكررة في `src/js/modules/projects.js`.
  - المشاريع غير الموجودة في الكتالوج (Gem-PRO، islams-wep، Maarifah، KING2) تُضاف كسجلات بفئة مناسبة، أو تُحذف حسب قرارك.
  - تُعرض البطاقات وقت البناء (Nunjucks) بدل حقنها بـ JS، فيختفي نص "Offline Mode".
- **الأرقام تُحسب وقت البناء** من البيانات الحقيقية:
  - عدد المشاريع حسب الحالة.
  - عدد APK من `apks/updates.json`.
  - آخر إصدار من `_data/releases.js`.
  - رقم "15 repos" يُحذف لأنه لا يمكن حسابه دون شبكة.
- إزالة الادعاءات غير الصحيحة: "Every one is a PWA"، "all open source"، وشارات Open Source غير المؤكدة.
- توحيد السيرة: جملة تعريف واحدة تُعاد في الرئيسية وAbout وmeta، وتُحفظ في `_data/site.json`، ونصها النهائي حسب إجابتك.
- ترجمة أوصاف Maarifah وKING2 إلى الإنجليزية.
- **اسم واحد لكل منتج** يطابق الكتالوج: KingCraft، Rust Construction، Farm Empire، Calculator Vault، Quiz Master، Quran Pro، Rashid AI.
  - يُطبَّق في `manifest.json` و`llms.txt` و`okf/` و`downloads.njk` و`<title>`.
  - `capacitor.config.json` الخاص بالتطبيقات **خارج النطاق** لأنه يمسّ بناء APK. أذكره كدَين.
- وصف Quran Pro يطابق الصفحة الفعلية: مشغّل تلاوات. ونفس المبدأ لـ Rashid AI: "Experimental"، بلا "10+ languages".
- تصحيح About:
  - حذف "FromLiten" و"directly integrated from GitHub".
  - المهارات تطابق الكود: إزالة Next.js/TypeScript أو وضعها تحت KING2 فقط.
  - خط زمني بلا تواريخ مختلقة، إلا ما تؤكده.
- سياسة الخصوصية: إضافة الخدمات المستخدمة فعلاً، وتحديث التاريخ.
  - **Impressum**: يحتاج اسمك وعنوانك الحقيقي، ولن أختلقه. أضيف هيكل الصفحة فقط إن طلبت.
- المدونة: تصحيح الأخطاء الواقعية في المقالين المذكورين فقط. كتابة مقالات جديدة خارج النطاق.

### المرحلة B — إعادة تصميم الرئيسية (هاتف أولاً)
البنية المقترحة:
1. Hero قصير.
2. **3–4 مشاريع مميزة** فقط ببطاقات أكبر ولقطات حقيقية.
3. رابط "كل المشاريع" إلى King Studio.
4. About مختصر بأرقام حقيقية.
5. Contact.

النتيجة المتوقعة: الصفحة على الهاتف تقريباً ثلث طولها الحالي.

تفاصيل إضافية:
- **لقطات حقيقية:** تُلتقط بـ Playwright من الصفحات الحية نفسها (`/games/*`، `/apps/*`)، وتُحفظ WebP في `images/screenshots/`.
  - المشاريع التي لا يمكن تشغيلها (Gem-PRO، KING2) تحصل على غلاف بسيط باسمها، لا صورة terminal مزيفة.
  - نفس الصور تُستخدم في بطاقات King Studio الفارغة.
- زر المساعد الصوتي: يُزاح فوق شريط الكوكيز عند ظهوره، أو يُخفى خلف رابط في القائمة، حسب قرارك.
- يبقى كل شيء على `css/tokens.css` وقواعد `DESIGN.md`. لا هوية بصرية جديدة. التحسين في الترتيب والصور والمحتوى، لا في الألوان.

### المرحلة C — الصفحات القديمة
القرار لكل صفحة: ترحيل إلى النظام الموحد، أو إزالة من الموقع مع redirect، أو إبقاء كما هي دون ربط من القائمة.
- توصيتي:
  - **devos**: إزالة مع redirect إلى الرئيسية، لأن محتواها مزيف ومكسور.
  - **vault**: تحويله إلى صفحة توثيق داخل `layouts/base.njk`، أو إزالته.
  - **RashidClaw**: إبقاؤه دون ربط حتى يُتحقق من قدراته، مع إصلاح خطأ JS.
  - **quran**: كما هو.
- كل إزالة تتطلب:
  - redirect 301 في `vercel.json`.
  - تحديث `sitemap.xml` و`eleventy.config.mjs`/`scripts/check-url-surface.mjs`.
  - تمرير `npm run verify`.

### إصلاحات صغيرة ترافق المراحل
- السماح بـ formsubmit.co في `connect-src` ضمن CSP، أو حذف الـ fallback.
- نسخة واحدة من Font Awesome.

## الملفات الأساسية
`index.njk`, `css/home.css`, `src/js/modules/projects.js`, `src/js/main.js`, `_data/studioCatalog.json`, `_data/kingStudio.js`, `_data/site.json`, `about.njk`, `vercel.json`, `sitemap.xml`, `eleventy.config.mjs`, `scripts/check-url-surface.mjs`, `scripts/site-templates.mjs`, `images/screenshots/*`, `tests/site-shell.test.mjs` و`tests/king-studio.test.mjs`، مع إضافة فحص أن الرئيسية والكتالوج من المصدر نفسه، وأن الأرقام ليست ثابتة.

## التحقق
- `npm run build && npm run verify && npm test` في كل PR.
- Playwright على 320 و375 و768 و1024 و1440px:
  - لا تمرير أفقي.
  - لا صور مكسورة.
  - لا أخطاء console.
  - قائمة الهاتف تعمل.
  - مقارنة طول الرئيسية قبل/بعد.
- لقطات قبل/بعد (هاتف + كمبيوتر) تُرسل لك قبل الدمج.
- معاينة Vercel للفرع، ولا دمج إلا بموافقتك. بعد الدمج: فحص النشر READY وجلب الصفحات.

## الترتيب والحجم المتوقع
- 4 PRs متتالية: 0 → A → B → C.
- 0 وA صغيران نسبياً، وB الأكبر لأنه يشمل إعادة بناء الرئيسية واللقطات.
- كل PR يُعرض عليك بمعاينة Vercel قبل الدمج.

## ما لا أعرفه (يحتاج تأكيدك)
- ما هي المشاريع المفتوحة المصدر فعلاً؟
- الدور الذي تريد تقديمه: AI engineer أم Full-stack، وألمانيا كموقع؟
- معنى "FromLiten".
- صحة الخط الزمني.
- هل Gem-PRO وKING2 وMaarifah مشاريع قائمة تريد عرضها؟

## حالة التنفيذ (2026-10-18)
- **المرحلة 0 بدأت محلياً، لم تُلتزم بعد:**
  - `connect-src` يسمح بـ `https://formsubmit.co`.
  - حذف "Alking" من meta وJSON-LD.
  - حذف خريطة المساهمات الوهمية من `src/js/modules/github.js`.
  - استثناء `games/kingcraft1/` من النشر في `eleventy.config.mjs` و`scripts/check-url-surface.mjs` و`.vercelignore`.
- **متبقٍّ من المرحلة 0:**
  - الروابط الميتة في `okf/` و`manifest.json` و`showcase.html`.
  - AdSense قبل الموافقة.
  - ثم `build` و`verify` و`test`، وPR.
- المراحل A وB وC لم تبدأ.
