# خطة إعادة تصميم القوائم — KingCraft

## الهدف
تحويل القائمة البسيطة الحالية إلى نظام متكامل: عوالم متعددة، حفظ لكل عالم، قائمة إيقاف، إعدادات متطورة، وشكل احترافي مثل Minecraft الحقيقي.

---

## الخطوات

### 1. WorldManager.js — نظام العوالم
**ملف جديد:** `js/utils/WorldManager.js`
- تخزين العوالم في IndexedDB (object store "worlds")
- كل عالم: id, name, seed, gameMode, difficulty, created, lastPlayed, playTime
- دوال CRUD: createWorld, deleteWorld, listWorlds, getWorld, updateWorld
- حفظ/تحميل حالة اللاعب لكل عالم (player data في IndexedDB "saves")
- تعديل مفتاح الـ chunks: `"worldId,cx,cz"` بدل `"cx,cz"`
- دوال عالمية: loadSettings/saveSettings في localStorage
- ترحيل تلقائي لـ legacy save عند أول تشغيل

### 2. تعديل SaveLoad.js
- تحديث دوال saveChunk/loadChunk/hasChunk لقبول worldId
- دوال saveGame/loadGame/deleteSave تبقى لكن تستخدم WorldManager داخلياً
- إضافة دالة `setWorldId(id)` لتحديد العالم النشط

### 3. index.html — هيكل القوائم الجديد
استبدال القائمة الحالية بـ:

#### القائمة الرئيسية (#menu)
```
┌────────────────────────────────┐
│         🏰 KingCraft           │
│        عالم المكعبات             │
│                                │
│    [▶ Singleplayer]            │
│    [🌐 Multiplayer (قريباً)]   │
│    [⚙ Settings]                │
│    [✕ Quit]                    │
└────────────────────────────────┘
```

#### شاشة اختيار العالم (#world-select)
```
┌────────────────────────────────┐
│  Singleplayer                  │
│                                │
│  ┌ World 1 ───────┐           │
│  │ ⏱ 5h 30m       │ ▶         │
│  └────────────────┘           │
│  ┌ World 2 ───────┐           │
│  │ ⏱ 2h 15m       │ ▶         │
│  └────────────────┘           │
│  [➕ Create New World]         │
│  [← Back]                      │
└────────────────────────────────┘
```

#### شاشة إنشاء عالم (#world-create)
```
┌────────────────────────────────┐
│  Create New World              │
│                                │
│  World Name: [__________]      │
│  Seed: [12345] [🎲 Random]    │
│  Mode: [Survival ▾]            │
│  Difficulty: [Normal ▾]        │
│                                │
│  [✓ Create World]              │
│  [← Back]                      │
└────────────────────────────────┘
```

#### قائمة الإيقاف (#pause-menu)
```
┌────────────────────────────────┐
│         ⏸ PAUSED              │
│                                │
│  [▶ Resume]                    │
│  [💾 Save World]               │
│  [⚙ Settings]                  │
│  [🏠 Save & Quit to Title]     │
│  [✕ Quit to Desktop]          │
└────────────────────────────────┘
```

#### عناصر إضافية
- `#modal-delete` — تأكيد حذف العالم
- `#settings-panel` — إعدادات موسعة (تطوير القائمة الحالية)

### 4. menu.css — تصميم واقعي مثل Minecraft
- **خلفية متحركة**: بانوراما مكونة من مكعبات تراب/حجر/عشب تتحرك (CSS animation)
- **الأزرار**: أزرار Minecraft حقيقية مع bevel borders (أفتح أعلى/يسار، أغمق أسفل/يمين)
  - hover: إضاءة بنسبة 20%
  - active (pressed): عكس الـ bevel
- **العناوين**: نص أبيض كبير مع ظل متعدد الطبقات
- **بطاقات العوالم**: خلفية dark panel مع border رمادي، hover effect، أيقونة العالم
- **قائمة الإيقاف**: خلفية شبه شفافة `rgba(0,0,0,0.6)` > `backdrop-filter: blur(4px)`
- **الترانزيشن**: all فيها `transition: 0.15s ease`
- **نفس الأسلوب**: pixel-art محافظ، ألوان Minecraft (بني/رمادي/أخضر)

### 5. main.js — ربط كل شيء
- **import WorldManager** وربطه مع النظام
- **startGame()** ← تستقبل world object بدل ما تقرأ legacy save
- **startGame()** تستخدم `loadPlayerData(worldId)` لاسترجاع التقدم
- **autoSave** تستخدم `savePlayerData(worldId, ...)` + `saveChunk(worldId, ...)`
- **Escape key** ← تفتح `#pause-menu` (إذا اللعبة شغالة والـ inventory مقفول)
- **إخفاء القائمة**: حسب الشاشة (main/world-select/world-create)
- **transition بين الشاشات**: show/hide مع class

### 6. الإعدادات الموسعة (#settings-panel)
المحافظة على الإعدادات الحالية + إضافة:
- **Master Volume**: 0-100 (slider)
- **SFX Volume**: 0-100 (slider)
- **Music Volume**: 0-100 (slider)
- **Sensitivity**: 1-20 (slider) — موجود
- **Render Distance**: 4-16 chunks (slider)
- **FOV**: 60-110 (slider)  
- **Brightness**: 0.5-1.5 (slider) — يؤثر على ambient light
- **Auto-Jump**: toggle
- **Invert Y**: toggle
- **Language**: العربية / English

### 7. الترقية من النظام القديم
- عند أول تشغيل بعد التحديث، `WorldManager` يكتشف وجود `kc-save` القديم
- ينشئ عالم افتراضي "My World" وينقل البيانات إليه
- يهاجر chunks الموجودة من مفتاح `"cx,cz"` إلى `"default,cx,cz"`
- بعد النجاح، يحذف `kc-save` القديم

---

## الملفات المتأثرة

| الملف | نوع التغيير |
|---|---|
| `js/utils/WorldManager.js` | ✨ جديد |
| `js/utils/SaveLoad.js` | 🔄 تعديل (إضافة worldId) |
| `index.html` | 🔄 تعديل (إعادة هيكلة القوائم) |
| `css/menu.css` | 🔄 تعديل (تصميم جديد كلياً) |
| `js/main.js` | 🔄 تعديل (ربط WorldManager, pause menu) |
| `js/ui/InventoryUI.js` | تغيير بسيط (زر خروج, ربط pause) |

---

## ترتيب التنفيذ

1. ✅ WorldManager.js — إنشاء الملف
2. ✅ تعديل SaveLoad.js لإضافة worldId مع backward compatibility
3. ✅ تحديث index.html — هيكل القوائم الجديد
4. ✅ إعادة كتابة menu.css — تصميم واقعي
5. ✅ تحديث main.js — ربط كل شيء + pause menu
6. ✅ توسيع الإعدادات
7. ✅ اختبار وضبط (build يمر بنجاح)

---

## ملاحظات فنية
- IndexedDB upgrade من v1 إلى v2 مع إضافة object stores جديدة
- كل دوال الـ WorldManager غير متزامنة (async/await)
- localStorage للعبة عموماً، IndexedDB للعوالم والـ chunks
- أي خطأ في IndexedDB يعود value افتراضي بدل ما يوقف اللعبة
