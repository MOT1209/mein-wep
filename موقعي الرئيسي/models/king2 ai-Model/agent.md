# agent.md - Alking Agent Project File

## 1. القواعد العامة والخطوط الحمراء لـ Alking (صارم جداً)

هذا القسم دستور ثابت لعمل Alking Agent داخل مشروع `king2 ai`، ويجب الالتزام به قبل أي تحليل أو تعديل أو تنفيذ.

1. **ممنوع الارتجال أو التخمين:** يمنع منعاً باتاً كتابة أي كود، تعديل أي ملف، أو إضافة ميزات من رأس المساعد أو بناءً على توقعات شخصية.
2. **قاعدة "اسأل أولاً":** إذا وُجد أي غموض، أو نقص في البيانات، أو احتاج المساعد لاتخاذ قرار تقني غير محسوم، يجب طرح سؤال واضح ومباشر على راشد (Alking)، وانتظار رده الموافق قبل إجراء أي تعديل.
3. **لغة التواصل:** التواصل دائماً باللغة العربية بأسلوب مباشر وسريع وبدون مقدمات طويلة أو حشو زائد.
4. **التوثيق قبل التنفيذ:** أي مهمة مستقبلية يجب توثيقها في سجل الذاكرة بعد موافقة راشد، مع ذكر الملفات المتأثرة والأوامر المستخدمة والنتيجة.
5. **عدم حذف أو عكس تغييرات موجودة:** لا يتم حذف ملفات، تنظيف Git، حل تعارضات، أو عكس تغييرات قائمة إلا بأمر صريح من راشد.

## 2. هيكلية المشروع الحالية (Project Structure)

تم فحص الجذر الحالي:

```text
king2 ai/
├── .claude/
├── .codex/
├── .git/
├── .minimax/
├── Alking.ai-king2/
├── Alking_Memory/
├── frontend/
├── king2.1/
├── next-frontend/
├── skills/
├── templates/
├── admin_core.py
├── admin_db.py
├── api_config.json
├── api_manager.py
├── app.py
├── database.py
├── DEPLOY.md
├── islamic_injection.py
├── kaggle_search.py
├── king2_core.db
├── king2_engine.py
├── knowledge_base.json
├── knowledge_base.py
├── knowledge_db.py
├── memory.json
├── opencode.json
├── PRD.md
├── README.md
├── render.yaml
├── requirements.txt
├── self_learning.py
├── sovereign_data_injection.py
├── supabase_client.py
├── supabase_schema.sql
├── test_api.py
├── universal_injection.py
└── video_editor.py
```

### الباك إند الرئيسي

- المسار: جذر المشروع.
- نقطة الدخول الأساسية: `app.py`.
- التقنية: Python مع FastAPI و Uvicorn.
- ملفات داعمة:
  - `king2_engine.py`: محرك الذكاء الاصطناعي.
  - `self_learning.py`: التعلم الذاتي.
  - `database.py`, `knowledge_db.py`, `king2_core.db`: تخزين محلي/SQLite.
  - `supabase_client.py`, `supabase_schema.sql`: تكامل Supabase.
  - `api_manager.py`, `api_config.json`: إدارة مزودي API.
  - `video_editor.py`: وظائف تحرير/مونتاج الفيديو.
  - `kaggle_search.py`: تكامل Kaggle.
  - ملفات الحقن المعرفي: `islamic_injection.py`, `peace_injection.py`, `sovereign_data_injection.py`, `universal_injection.py`.

### واجهة HTML القديمة

- المسار: `frontend/`.
- المحتويات:
  - `frontend/index.html`
  - `frontend/auth-callback.html`
  - `frontend/css/style.css`
  - `frontend/js/script.js`
- يتم تقديم ملفات `css` و `js` من داخل `app.py` عبر FastAPI StaticFiles.

### قوالب الإدارة والصفحات

- المسار: `templates/`.
- المحتويات:
  - `about.html`
  - `admin.html`
  - `admin_login.html`

### واجهة Next.js الجديدة

- المسار: `next-frontend/`.
- التقنية: Next.js 14 App Router، React 18، TypeScript، Tailwind CSS، NextAuth، Prisma، PostgreSQL.
- ملفات رئيسية:
  - `next-frontend/package.json`
  - `next-frontend/app/`
  - `next-frontend/components/`
  - `next-frontend/lib/`
  - `next-frontend/prisma/schema.prisma`
  - `next-frontend/vercel.json`
  - `next-frontend/next.config.js`
- قاعدة البيانات في الواجهة الجديدة:
  - Prisma datasource يستخدم PostgreSQL عبر `DATABASE_URL`.
  - الجداول/النماذج الموثقة في `schema.prisma`: User, UserSettings, Conversation, Message, Attachment, Reaction, KnowledgeBase, Session, VerificationToken, Account, MessageRole.

### ذاكرة Alking

- المسار: `Alking_Memory/`.
- المحتويات:
  - `memory_config.json`
  - `audio/audio_memory.json`
  - `images/image_memory.json`
  - `prompts/prompts.json`
  - `text/heavy_memory.json`
  - `text/knowledge.json`
- ملاحظة: ملفات الذاكرة النصية كبيرة الحجم ويجب التعامل معها بحذر وعدم تعديلها إلا بأمر صريح.

### المهارات

- المسار: `skills/`.
- المحتويات الحالية:
  - `base_skill.py`
  - `calculator.py`
  - `web_search.py` ← 🆕 مهارة تصفح الويب (تحليل 4 مستودعات + MPC)
  - `__init__.py`

### نسخ/مجلدات إضافية داخل المشروع

- `Alking.ai-king2/`: نسخة/مجلد مشروع داخلي يحتوي ملفات مشابهة ومجلدات مثل `next-frontend`, `frontend`, `templates`, `uploads`, وملفات بيئة وقواعد بيانات.
- `king2.1/`: يحتوي `Alking_AI_Platform/`, `Alking_Memory/`, وملفات إضافية.
- لا يتم اعتماد هذه المجلدات كنسخة تشغيل رئيسية إلا بعد أمر واضح من راشد.

## 3. حالة التزامن والـ Git (Git Status)

- الفرع الحالي: `main`.
- آخر Commit محلي:

```text
b44c497 feat: integrate Next.js chat frontend, clean duplicates, and apply security fixes
```

- المستودع البعيد المسجل:

```text
origin https://github.com/MOT1209/Alking.ai-king2.git
```

- حالة الربط مع الفرع البعيد:
  - لا يوجد upstream مضبوط للفرع المحلي `main`.
  - نتيجة التحقق: `fatal: no upstream configured for branch 'main'`.
  - لذلك لا يمكن تأكيد آخر حالة رفع من Git المحلي وحده.

- حالة شجرة العمل:
  - غير نظيفة.
  - توجد ملفات كثيرة مضافة ومعدلة ومحذوفة.
  - توجد حالات تعارض/إضافة مزدوجة ظاهرة بعلامة `AA` في `git status`.
  - توجد مجلدات غير متتبعة مثل:
    - `Alking.ai-king2/.agent/`
    - `Alking.ai-king2/next-frontend/node_modules/`
    - `next-frontend/node_modules/`
    - `PRD.md`
    - `opencode.json`

- الحكم الحالي:
  - المستودع ليس في حالة مستقرة.
  - لا يجب تنفيذ commit أو push أو تنظيف الملفات أو حل التعارضات إلا بأمر مباشر من راشد.

## 4. دليل الأوامر التشغيلية (Command Registry)

### أوامر الباك إند المحلي

تثبيت الاعتمادات:

```bash
pip install -r requirements.txt
```

تشغيل الباك إند من جذر المشروع:

```bash
python app.py
```

تشغيل الباك إند عبر Uvicorn:

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 5000
```

منطق المنفذ داخل `app.py`:

```text
PORT من متغير البيئة، وإذا لم يوجد يستخدم 5000.
```

أمر النشر الموجود في `render.yaml`:

```bash
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port $PORT
```

### أوامر واجهة Next.js

المسار:

```bash
cd next-frontend
```

تثبيت الاعتمادات:

```bash
npm install
```

تشغيل التطوير المحلي:

```bash
npm run dev
```

البناء:

```bash
npm run build
```

تشغيل نسخة الإنتاج محلياً:

```bash
npm run start
```

فحص lint:

```bash
npm run lint
```

Prisma:

```bash
npm run db:push
npm run db:generate
npm run db:studio
```

أوامر scripts الفعلية في `next-frontend/package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate",
  "db:push": "prisma db push",
  "db:generate": "prisma generate",
  "db:studio": "prisma studio"
}
```

### النشر

باك إند Render:

- الملف: `render.yaml`.
- الخدمة: `alking-ai-king2`.
- البيئة: Python.
- Root Directory: `.`.
- Build Command:

```bash
pip install -r requirements.txt
```

- Start Command:

```bash
python -m uvicorn app:app --host 0.0.0.0 --port $PORT
```

واجهة Next.js على Vercel:

- الملف: `next-frontend/vercel.json`.
- framework:

```json
{
  "framework": "nextjs"
}
```

### متغيرات البيئة المهمة المرصودة

من `next-frontend/.env.example`:

```text
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
E2E_TEST_EMAIL
E2E_TEST_PASSWORD
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GOOGLE_AI_API_KEY
GROQ_API_KEY
ZAI_API_KEY
AIKING_IDENTITY
AIKING_VERSION
NODE_ENV
```

من `render.yaml`:

```text
PYTHON_VERSION=3.11
SUPABASE_URL
OAUTH_REDIRECT_BASE=https://alking-ai-king2-1.onrender.com
```

## 5. سجل الذاكرة والتوثيق المستقبلي (Future Logs)

هذا القسم مخصص لتوثيق المهام القادمة بعد موافقة راشد فقط.

### سجل المهام

```text
1. 2026-05-25 — دمج مهارة تصفح الويب (Web Browsing Skill)
   الطلب: دراسة 4 مستودعات MCP مفتوحة المصدر ودمج قدرة البحث الحي
   القرار: تمت الدراسة والدمج (open-webSearch + DuckDuckGo fallback)
   الملفات المتأثرة: skills/web_search.py (جديد), agent.md (تحديث)
   الأوامر: npx open-websearch@latest (اختياري لتشغيل Daemon)
   ملاحظات: MPC مدمج عبر can_handle() — لا يحتاج نموذج إضافي
```

### قالب التوثيق القادم

```text
التاريخ:
طلب راشد:
قرار راشد:
الملفات المتأثرة:
الأوامر المستخدمة:
النتيجة:
ملاحظات:
```

## 6. مهارة تصفح الويب (Web Browsing Skill) — مستودعات مفتوحة المصدر

### المصادر المعتمدة (تم تحليلها بتاريخ 2026-05-25):

| المستودع | اللغة | النوع | الرابط |
|----------|-------|-------|--------|
| MCP Servers (Fetch) | Python | خادم MCP رسمي لجلب URLs وتحويل HTML→Markdown | `modelcontextprotocol/servers` |
| open-webSearch | TypeScript | MCP متعدد المحركات + CLI + Daemon (10 محركات) | `Aas-ee/open-webSearch` |
| mcp-web-search-tool | TypeScript | MCP بحث (Brave + DuckDuckGo) مع حماية SSRF | `gabrimatic/mcp-web-search-tool` |
| webSearch-Tools | Python | MCP بحث عبر Firecrawl API (كشط وزحف) | `josemartinrodriguezmortaloni/webSearch-Tools` |

### آلية MPC (التحكم والتوقع الديناميكي) لتصفح الويب:

**المبدأ:** يتوقع المساعد متى يحتاج المستخدم معلومات حية، ويمنع جلب صفحات كاملة ثقيلة لحماية التوكينز.

1. **التصنيف التلقائي للاستعلامات — أنماط تستدعي البحث الحي:**
   - أخبار/أحداث جارية (اخبار, news, today, حدث)
   - أسعار/أسواق (سعر, price, سوق stock)
   - طقس (weather, طقس)
   - إصدارات وتحديثات (release, version, إصدار)
   - نتائج وبيانات رقمية حديثة (results, score, 2026)
   - روابط ومواقع محددة (url, link, موقع, ابحث عن)

2. **التسلسل الهرمي لمصادر البحث (الأفضل فالأقل):**
   - المستوى 1: `open-webSearch` Daemon (HTTP على port 3000) ← متعدد المحركات بدون مفاتيح
   - المستوى 2: DuckDuckGo HTML Scraping (keyless, مدمج في الـ Skill)
   - المستوى 3: جلب URL مباشر عبر `requests` + `BeautifulSoup` (لقراءة صفحات محددة)

3. **قواعد حماية السياق (Context Protection):**
   - `max_chars` افتراضي: 5000 حرف (قابل للزيادة عند الطلب)
   - عدد النتائج الافتراضي: 5 (قابل للزيادة حتى 20)
   - منع جلب صفحات كاملة > 200,000 حرف
   - استخدام `start_index`/`cursor` للقراءة المجزأة (chunked reading)

### الملفات المنشأة/المعدلة:

- **جديد:** `skills/web_search.py` — ملف مهارة البحث (BaseSkill)
  - دالتان: `execute(query)` للبحث، `execute_fetch(url)` لقراءة صفحة
  - يعتمد على `requests` + `BeautifulSoup` (موجودان مسبقاً في `requirements.txt`)
  ```json
  {
    "skill_name": "WebSearchSkill",
    "can_handle_patterns": ["اخبار", "سعر", "طقس", "news", "price", "بحث", "موقع", "اليوم", "2026"],
    "dependencies": ["requests", "beautifulsoup4"],
    "default_max_chars": 5000,
    "default_results_count": 5
  }
  ```

- **محدث:** `skills/__init__.py` — يقوم تلقائياً بتحميل أي Skill جديد في المجلد
- **محدث:** `agent.md` (هذا القسم) — توثيق المهارة وقواعدها

### أوامر تشغيل open-webSearch (اختياري — للمستوى 1):

```bash
# تشغيل Daemon محلياً (يتطلب Node.js)
npx open-websearch@latest

# أو مع محرك بحث محدد
$env:DEFAULT_SEARCH_ENGINE="duckduckgo"; npx open-websearch@latest

# التحقق من حالة الـ Daemon
# http://localhost:3000/health
```

### هيكلية الـ Skill:

```text
skills/
├── __init__.py          ← auto-loader (load_skills)
├── base_skill.py        ← BaseSkill (interface)
├── calculator.py        ← مثال قديم
└── web_search.py        ← 🆕 مهارة تصفح الويب الجديدة
    ├── WebSearchSkill (BaseSkill)
    │   ├── can_handle(query) → bool
    │   ├── execute(query) → str
    │   └── execute_fetch(url) → str
    ├── _needs_web_search(query) → bool  (MPC)
    ├── _search_open_websearch(query, limit) → list
    ├── _search_duckduckgo(query, limit) → list
    └── _fetch_url_content(url, max_chars) → str
```

### ملاحظات الدمج:

- الـ Skill لا يعدّل أي ملف موجود، فقط يُضاف كملف جديد في `skills/`
- `__init__.py` يكتشفه تلقائياً ويحمّله مع باقي المهارات
- `beautifulsoup4` و `requests` موجودان بالفعل في `requirements.txt`
- إذا شغّلت `open-webSearch` Daemon يستخدمه مباشرة (أسرع وأدق)، وإلا يرجع لـ DuckDuckGo
- MPC مدمج في `can_handle()` عبر أنماط Regex — لا يحتاج تشغيل نموذج إضافي
