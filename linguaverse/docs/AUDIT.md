# LinguaVerse — تقرير تدقيق شامل وخارطة تحسين

**تاريخ التدقيق:** 2026-08-11
**نطاق التدقيق:** كامل المستودع — 26 ملف Kotlin (4,661 سطر)، طبقة البيانات، الواجهة، التنقّل، إدارة الحالة، الاعتماديات، البناء، الأمن.
**الحكم العام:** نموذج أولي (MVP) بواجهة جيدة المظهر لكنه **يوهم بميزات غير موجودة**، وطبقة بياناته تمسح تقدّم المستخدم عند كل إقلاع، وحزمة الاختبارات لا تُصرَّف أصلًا.

---

## 1. البنية الحالية

```
com.example
├── MainActivity            (39)   — Activity واحد، ViewModel واحد
├── ai/GeminiTutorService   (235)  — object مفرد، Retrofit، بدون حَقن
├── audio/TtsManager        (57)   — TTS
├── data/
│   ├── db/AppDatabase      (45)   — Room، نسخة 1، fallbackToDestructiveMigration
│   ├── db/LinguaVerseDao   (112)  — DAO واحد لكل الكيانات التسعة
│   ├── model/Models.kt     (228)  — 9 كيانات + 3 enums + Converters، ملف واحد
│   └── repository/         (240)  — Repository واحد + بيانات البذور مضمّنة
└── ui/
    ├── LinguaVerseApp      (207)  — "تنقّل" يدوي عبر when/booleans
    ├── viewmodel/MainViewModel (292) — ViewModel إله واحد لكل التطبيق
    ├── components/         (217)
    └── screens/ ×8         (2,231)
```

**الخلاصة المعمارية:** لا توجد طبقة نطاق (domain)، لا حَقن اعتماديات، لا واجهات (interfaces) لأي تبعية، لا وحدات (modules)، ViewModel واحد يعرف كل شيء. كل شاشة تستقبل حالتها كوسائط من الجذر — أي تغيير في أي تدفّق يعيد تركيب الشجرة بأكملها.

---

## 2. الأولوية: حرجة (Critical)

| # | المشكلة | الموقع | الأثر |
|---|---------|--------|-------|
| C1 | `GreetingScreenshotTest` يستدعي `MyApplicationTheme` و `Greeting` — **لا وجود لأيٍّ منهما** | `test/.../GreetingScreenshotTest.kt` | مجموعة مصادر الاختبار **لا تُصرَّف**؛ `gradlew test` يفشل قبل تشغيل أي اختبار |
| C2 | `ExampleRobolectricTest` يتوقّع `app_name == "My Application"` والقيمة `"LinguaVerse"` | `test/.../ExampleRobolectricTest.kt` | اختبار فاشل |
| C3 | `ExampleInstrumentedTest` يتوقّع `packageName == "com.example"` و `applicationId = "com.aistudio.linguaverse.app"` | `androidTest/...` | اختبار فاشل |
| C4 | **لا يوجد Gradle Wrapper في المستودع** (لا `gradlew` ولا `gradle-wrapper.properties`) | جذر المشروع | البناء غير قابل لإعادة الإنتاج؛ CI مستحيل؛ كل مطوّر ببنية مختلفة |
| C5 | **مفتاح Gemini يُحزَم داخل الـAPK** عبر `BuildConfig.GEMINI_API_KEY` ويُرسل كمعامل رابط `?key=` | `GeminiTutorService.kt:368,405` | أي شخص يستخرج المفتاح من الـAPK خلال دقائق. `metadata.json` يدّعي `SERVER_SIDE_GEMINI_API` بينما الاستدعاء عميلي مباشر |
| C6 | اسم النموذج `gemini-3.5-flash` **غير موجود** | `GeminiTutorService.kt:325` | كل استدعاء حقيقي يعيد 404 |
| C7 | `catch (e: Exception)` يبتلع الخطأ ويُرجع **ردًّا مزيّفًا جاهزًا** | `GeminiTutorService.kt:408,452` | مع C6: ميزة "المعلّم الذكي" **لم تعمل قط** ولا سبيل لاكتشاف ذلك — الفشل يبدو كنجاح |
| C8 | `onCloseLesson = { startLesson(activeLesson!!); nextExercise() }` | `LinguaVerseApp.kt:663` | **لا سبيل للخروج من الدرس**. يعيد تشغيله ثم يقفز؛ و`startLesson` غير متزامن فيتسابق مع `nextExercise`. يمنح XP مكرّرًا |
| C9 | `seedSpanishContent()` يعمل عند **كل إقلاع** بـ`OnConflictStrategy.REPLACE` | `Repository.kt:64,80-89` | **تقدّم المستخدم في الدروس يُمسح عند كل فتح للتطبيق** (`isCompleted` يعود false) |
| C10 | `fallbackToDestructiveMigration()` + `exportSchema = false` | `AppDatabase.kt:23,39` | أي تعديل على المخطّط يمحو كل بيانات المستخدمين، بلا هجرات ولا مخطّط مُصدَّر |
| C11 | `namespace = "com.example"` كحزمة للتطبيق كله | `app/build.gradle.kts:12` | حزمة عيّنة؛ تصادم أسماء واسم غير احترافي في كل أثر (stack trace) |
| C13 | `org.gradle.jvmargs` لا يثبّت اللغة، فتعمل الـJVM بلغة النظام (`ar`) | `gradle.properties` | **البناء يفشل كليًا على أي جهاز بلغة عربية**: مولّد Room يكتب أرقامًا هندية عربية في شيفرة Kotlin المولّدة (`var _argIndex: Int = ١`) فيفشل التصريف. مُثبَت تجريبيًا في هذا التدقيق |
| C12 | `signingConfigs.debugConfig` يشير إلى `debug.keystore` في جذر المستودع، **والملف مُدرَج في `.gitignore` وغير موجود** | `app/build.gradle.kts` + `.gitignore` | **`assembleDebug` يفشل على أي نسخة جديدة من المستودع** عند `validateSigningDebug`. مُثبَت تجريبيًا في هذا التدقيق |

---

## 3. الأولوية: عالية (High)

**H1 — التنقّل مُلفَّق يدويًا.** `navigation-compose` مُعلَنة كاعتمادية لكنها **غير مستخدمة**. التنقّل عبارة عن `if (activeLesson != null) return`، `if (showAdminPanel) return`، `when (currentDestination)`. النتيجة: زر الرجوع في النظام لا يعمل، لا مكدّس رجوع، لا روابط عميقة، وكل الحالة تضيع عند موت العملية (`remember` بلا `rememberSaveable`).

**H2 — ViewModel إله.** `MainViewModel` (292 سطر) يبني `AppDatabase` و`Repository` و`TtsManager` بنفسه، ويحمل 20 تدفّقًا. لا يمكن اختباره وحدةً. `LinguaVerseApp` يجمع 15 تدفّقًا في الجذر → أي تغيّر يعيد تركيب الشجرة كاملة.

**H3 — لا حَقن اعتماديات ولا واجهات.** `GeminiTutorService` هو `object` مفرد ثابت. `LinguaVerseRepository` صنف ملموس. لا يمكن استبدال أيٍّ منهما بمزيّف في اختبار.

**H4 — منطق التصحيح خاطئ ومدفون.** `submitExerciseAnswer` يعتبر أي إجابة كتابية طولها > 3 أحرف صحيحة (`MainViewModel.kt:162`). أي "aaaa" ينجح. المنطق داخل الـViewModel لا في طبقة نطاق قابلة للاختبار.

**H5 — التفضيلات لا تُحفظ.** `_isDarkTheme` و`_audioSpeed` في الذاكرة فقط → تُصفَّر عند كل إقلاع. `androidx-datastore-preferences` موجودة في كتالوج الإصدارات لكنها **معطّلة بتعليق**.

**H6 — إذن `RECORD_AUDIO` مُعلَن ولا يُطلَب ولا يُستخدَم.** `SpeakingPracticeView` **يزيّف** درجة 92% ودقّة 95% بلا أي تسجيل (`SkillDetailScreen.kt:937`). هذا خطر سياسات على Google Play (إذن بلا استخدام + ادّعاء ميزة غير موجودة).

**H7 — محتوى إسباني مثبّت داخل الواجهة.** `ReadingStoryView`، `DailyPhrasesView`، `SpeakingPracticeView`، `LeaderboardScreen` تحوي نصوصًا إسبانية حرفية. اختيار اليابانية أو العربية لا يغيّر شيئًا في هذه الشاشات. حقل الكتابة يقول حرفيًا "Type your answer in Spanish" (`LessonScreen.kt:244`).

**H8 — لا تدويل (i18n) في تطبيق لتعلّم اللغات.** `strings.xml` يحوي مُدخلًا واحدًا. مئات السلاسل الإنجليزية مثبّتة في الشيفرة. `supportsRtl="true"` مُعلَن بينما العربية لغة هدف معروضة، ولا شيء اختُبر للاتجاه من اليمين لليسار، و`Icons.Default.ArrowBack` غير معكوس تلقائيًا.

**H9 — لا فهارس ولا مفاتيح أجنبية.** `exercises.lessonId`، `lessons.languageCode`، `vocabularies.languageCode` كلها بلا `@Index` وبلا `ForeignKey`. مسح كامل للجدول عند كل استعلام، وأيتام بلا قيود.

**H10 — لوحة الإدارة تُشحن في الإنتاج بلا أي حماية.** `AdminPanelScreen` متاحة من الإعدادات لأي مستخدم، وتكتب مباشرة في قاعدة البيانات.

**H11 — قدرات مُعلَنة غير مُنفَّذة.** `Flashcard.intervalDays/isMastered` و`Vocabulary.needsReview` حقول ميتة، بينما الواجهة تعد بـ"Spaced Repetition Cards". `ReadingStory` كصنف بيانات **لا يُستخدم إطلاقًا**. درجات الملف الشخصي (`speakingScore=78`…) قيم ابتدائية لا يحدّثها أي مسار في الشيفرة.

---

## 4. الأولوية: متوسطة (Medium)

**M1 — منطق مكرّر.** `parseOptionsJson` في `LessonScreen.kt:400` نسخة مكرّرة من `Converters.toStringList`، **وينشئ كائن `Moshi` جديدًا داخل التركيب** — أي عند كل إعادة تركيب.

**M2 — ألوان مثبّتة تتجاوز الثيم.** ~30 موضعًا بـ`Color(0xFFDCFCE7)` وأمثالها (`LessonScreen`, `CommonUiComponents`, `SkillsHubScreen`…). كلها ألوان فاتحة → **غير مقروءة في الوضع الداكن**. والثيم نفسه يعرّف 5 أدوار فقط ويترك كل ألوان الحاويات على افتراضيات M3 المتضاربة مع الإنديغو المخصّص.

**M3 — إعدادات الإصدار (release).** `isMinifyEnabled = false` → لا تصغير ولا تعتيم. `signingConfigs` يشير إلى `my-upload-key.jks` غير موجود ويقرأ كلمات السر من متغيّرات بيئة غير مضبوطة → بناء الإصدار يفشل خارج جهاز محدّد.

**M4 — Moshi غير مضبوط لـKotlin في الشبكة.** `MoshiConverterFactory.create()` بلا `KotlinJsonAdapterFactory` ولا مُولِّد codegen على DTOs الشبكة، رغم أن `moshi-kotlin-codegen` مُفعَّل عبر KSP. القيم الافتراضية في `GeminiResponse` قد لا تُطبَّق. ولا قواعد ProGuard للانعكاس (reflection) إن فُعِّل التصغير لاحقًا.

**M5 — اعتماديات غير مستخدمة تُثقل الحزمة.** `coil-compose`، `firebase-ai`، `firebase-appcheck-recaptcha`، `logging-interceptor`، وإضافة `google-services` بلا ملف `google-services.json`. و`material-icons-extended` (ضخمة) تُستورد بـ`import ...filled.*` في كل ملف.

**M6 — شريط تنقّل بستة عناصر.** إرشادات Material 3 تحدّد 3–5. `Profile` و`Settings` كلاهما في الشريط.

**M7 — TTS لا يتحقّق من النتيجة.** `tts?.language = locale` يتجاهل `LANG_MISSING_DATA` / `LANG_NOT_SUPPORTED` → ينطق النص بلغة خاطئة صامتًا (`TtsManager.kt:555`).

**M8 — لا حالات تحميل/فراغ/خطأ.** معظم القوائم تعرض شاشة بيضاء عند الفراغ. لا رسالة خطأ في أي مكان في التطبيق.

**M9 — لوحة الصدارة كلها بيانات وهمية** مثبّتة في الشاشة (`LeaderboardScreen.kt:31-38`).

**M10 — تفاصيل Compose.** `mutableStateOf(0)` بدل `mutableIntStateOf`؛ `Icons.Default.ArrowBack` مهمَل لصالح `AutoMirrored`؛ استيرادات wildcard في كل ملف.

---

## 5. الأولوية: منخفضة (Low)

- L1: بقايا سقالة — `assets/.aistudio`، `README.md` افتراضي، `themes.xml` باسم `Theme.MyApplication`.
- L2: `Models.kt` ملف واحد يجمع 9 كيانات + 3 enums + المحوّلات — يجب تفكيكه.
- L3: لا `ktlint` / `detekt` / `.editorconfig`.
- L4: كتالوج الإصدارات يحوي ~12 مُدخلًا غير مستخدم (camera، location، accompanist، credentials، googleid).
- L5: `enableEdgeToEdge()` مُفعَّل لكن الفروع غير المبنية على `Scaffold` لا تعالج حشوة شريط الحالة.

---

## 6. خارطة التنفيذ (مراحل، كل مرحلة بـcommit مستقل وتحقّق بناء)

| المرحلة | العنوان | يعالج |
|---------|---------|-------|
| **0** | تثبيت البناء: إضافة Gradle Wrapper، إصلاح/حذف اختبارات السقالة الميتة، `local.properties` | C1–C4 |
| **1** | إيقاف فقدان البيانات: بذور تُنفَّذ لمرة واحدة، هجرات Room + `exportSchema`، فهارس ومفاتيح أجنبية | C9, C10, H9 |
| **2** | إصلاح تدفّق الدرس المكسور + منطق التصحيح إلى طبقة نطاق مُختبَرة | C8, H4 |
| **3** | الأمن والصدق: نقل مفتاح Gemini/التوثيق، تصحيح اسم النموذج، إظهار الأخطاء بدل التزييف، إزالة/تنفيذ ميزة النطق المزيّفة وإذن الميكروفون | C5, C6, C7, H6 |
| **4** | التنقّل: `navigation-compose` بمكدّس رجوع حقيقي و`rememberSaveable` | H1 |
| **5** | المعمارية: حَقن اعتماديات يدوي بحاويات + واجهات للمستودع وخدمة الذكاء + ViewModels لكل شاشة | H2, H3 |
| **6** | الاستمرارية: DataStore للثيم وسرعة الصوت + حماية لوحة الإدارة | H5, H10 |
| **7** | الثيم والتدويل: نقل الألوان المثبّتة إلى الثيم، ضبط الوضع الداكن، استخراج السلاسل إلى `strings.xml`، دعم RTL | M2, H8, H7 |
| **8** | التنظيف: إزالة الاعتماديات غير المستخدمة، إصلاح Moshi + ProGuard، تفعيل التصغير، حذف الشيفرة الميتة | M1, M4, M5, C11, L1–L5 |

**قاعدة التنفيذ:** لا إعادة كتابة من الصفر. كل مرحلة تحافظ على السلوك العامل، وتُصرَّف وتُبنى قبل الـcommit.

---

## 7. ما هو سليم فعلًا (يُحافَظ عليه)

- كتالوج الإصدارات (`libs.versions.toml`) منظّم ومركزي.
- الكيانات مُعرَّفة كـ`data class` غير قابلة للتغيير مع `copy()` — نمط سليم.
- `Flow` + `stateIn(WhileSubscribed(5000))` هو النمط الصحيح لربط Room بالواجهة.
- المكوّنات المشتركة في `CommonUiComponents.kt` قابلة لإعادة الاستخدام وحالتها مرفوعة (hoisted) بشكل صحيح.
- `testTag` موجودة على معظم العناصر التفاعلية — أساس جاهز لاختبارات الواجهة.
- اللغة البصرية للتصميم متماسكة (زوايا دائرية، تباعد، تدرّج هرمي).
