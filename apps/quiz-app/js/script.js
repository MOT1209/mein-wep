// Comprehensive Question Database
// Structure: quizDatabase[category] = [ level0[], level1[], ... ]
// Each level holds 10 questions: { question, options[], answer (index) }
const quizDatabase = {
    programming: [
        // LEVEL 1 (Base Questions)
        [
            { question: "ما هي لغة البرمجة التي تستخدم لإضافة التفاعلية للمواقع؟", options: ["HTML", "CSS", "JavaScript", "SQL"], answer: 2 },
            { question: "أي خاصية CSS تستخدم لتغيير لون الخلفية؟", options: ["color", "background-color", "bg-color", "fill"], answer: 1 },
            { question: "ماذا يرمز اختصار HTML؟", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Management Language"], answer: 0 },
            { question: "أي رمز يستخدم لتعريف الـ ID في CSS؟", options: [".", "#", "*", "@"], answer: 1 },
            { question: "كيف تقوم بتعريف مصفوفة في JavaScript؟", options: ["let arr = {}", "let arr = []", "let arr = ()", "let arr = <>"], answer: 1 },
            { question: "ما هو الوسم الصحيح لإضافة رابط؟", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1 },
            { question: "أي شركة قامت بتطوير لغة Java؟", options: ["Microsoft", "Google", "Sun Microsystems", "Apple"], answer: 2 },
            { question: "ما هي الوظيفة الأساسية لـ Git؟", options: ["تحرير الصور", "تنسيق النصوص", "نظام مراقبة النسخ (Version Control)", "استضافة قواعد البيانات"], answer: 2 },
            { question: "أي خاصية تستخدم لجعل النص عريضاً (Bold)؟", options: ["font-style", "font-weight", "text-decoration", "boldness"], answer: 1 },
            { question: "ماذا تعني SQL؟", options: ["Simple Query Language", "Standard Quiz Layer", "Structured Query Language", "Solution Query List"], answer: 2 }
        ],
        // LEVEL 2 (More Questions...)
        [
            { question: "ما هو محرك جافا سكريبت في متصفح Chrome؟", options: ["SpiderMonkey", "Chakra", "V8", "Nitro"], answer: 2 },
            { question: "أي عنصر HTML يستخدم لتضمين ملف JS خارجي؟", options: ["<javascript>", "<scripting>", "<script>", "<js>"], answer: 2 },
            { question: "ما هي القيمة الافتراضية للـ position في CSS؟", options: ["absolute", "relative", "static", "fixed"], answer: 2 },
            { question: "ما هي طريقة دمج مصفوفتين في JS؟", options: ["concat()", "combine()", "merge()", "append()"], answer: 0 },
            { question: "ماذا تعني API؟", options: ["Application Program Interface", "Advanced Programming Intel", "Apple Program Info", "Automated Process Ink"], answer: 0 },
            { question: "ما هو الخطأ في تسمية المتغير: let 1user؟", options: ["استخدام let", "بدء الاسم برقم", "استخدام كلمة user", "لا يوجد خطأ"], answer: 1 },
            { question: "أي نوع بيانات يمثله: true / false؟", options: ["String", "Number", "Boolean", "Undefined"], answer: 2 },
            { question: "ما هو الـ DOM؟", options: ["Document Object Model", "Data Object Management", "Digital Orbit Mode", "Desktop Output Monitor"], answer: 0 },
            { question: "أي مكتبة JS تستخدم لبناء واجهات مستخدم بأسلوب المكونات؟", options: ["jQuery", "React", "Django", "Laravel"], answer: 1 },
            { question: "كيف نكتب تعليقاً في CSS؟", options: ["// comment", "<!-- comment -->", "/* comment */", "# comment"], answer: 2 }
        ],
        // LEVEL 3 (Intermediate)
        [
            { question: "ما هي الطريقة الصحيحة لمنع تصرف النموذج (Form) الافتراضي؟", options: ["stop()", "end()", "preventDefault()", "halt()"], answer: 2 },
            { question: "أي محرك قواعد بيانات يستخدم 'Collection' بدلاً من 'Table'؟", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], answer: 2 },
            { question: "ما هو الـ 'Hoisting' في JavaScript؟", options: ["ضغط الكود", "رفع تعريفات المتغيرات للأعلى", "حذف الذاكرة غير المستخدمة", "دمج الملفات"], answer: 1 },
            { question: "أي جزء من الـ Box Model هو الأقرب للمحتوى؟", options: ["Border", "Margin", "Padding", "Outline"], answer: 2 },
            { question: "ما هي نتيجة: typeof []؟", options: ["array", "list", "object", "undefined"], answer: 2 },
            { question: "أي كلمة مفتاحية تستخدم لوراثة كلاس في JS؟", options: ["inherits", "extends", "implements", "from"], answer: 1 },
            { question: "ماذا يرمز اختصار JSON؟", options: ["JavaScript Object Notation", "Java Serialized Object Node", "Joint System Online Network", "Just Standard Object Name"], answer: 0 },
            { question: "أي دالة تستخدم لتحويل JSON إلى Object؟", options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "JSON.convert()"], answer: 0 },
            { question: "ما هي الوحدة التي تسمى: Viewport Width؟", options: ["vpw", "vw", "%", "px"], answer: 1 },
            { question: "أي كلمة مفتاحية تستخدم للانتظار داخل دالة async؟", options: ["wait", "delay", "await", "hold"], answer: 2 }
        ]
    ],
    general: [
        // LEVEL 1
        [
            { question: "ما هو أطول نهر في العالم؟", options: ["النيل", "الأمازون", "اليانغتسي", "المسيسيبي"], answer: 0 },
            { question: "كم عدد قارات العالم؟", options: ["5", "6", "7", "8"], answer: 2 },
            { question: "ما هي عاصمة اليابان؟", options: ["أوساكا", "طوكيو", "كيوتو", "ناغويا"], answer: 1 },
            { question: "ما هو أكبر كوكب في المجموعة الشمسية؟", options: ["زحل", "الأرض", "المشتري", "نبتون"], answer: 2 },
            { question: "من رسم لوحة الموناليزا؟", options: ["بيكاسو", "ليوناردو دافنشي", "فان جوخ", "مايكل أنجلو"], answer: 1 },
            { question: "ما هو العنصر الكيميائي الذي رمزه O؟", options: ["الذهب", "الأكسجين", "الحديد", "الأوزون"], answer: 1 },
            { question: "كم عدد أيام السنة الكبيسة؟", options: ["364", "365", "366", "367"], answer: 2 },
            { question: "ما هي أكبر دولة في العالم من حيث المساحة؟", options: ["كندا", "الصين", "روسيا", "أمريكا"], answer: 2 },
            { question: "ما هو الحيوان الذي يُلقب بسفينة الصحراء؟", options: ["الحصان", "الجمل", "الفيل", "الحمار"], answer: 1 },
            { question: "كم لوناً في قوس قزح؟", options: ["5", "6", "7", "8"], answer: 2 }
        ],
        // LEVEL 2
        [
            { question: "في أي عام بدأت الحرب العالمية الثانية؟", options: ["1914", "1939", "1945", "1929"], answer: 1 },
            { question: "ما هو أصغر كوكب في المجموعة الشمسية؟", options: ["المريخ", "عطارد", "الزهرة", "بلوتو"], answer: 1 },
            { question: "ما هي عملة المملكة المتحدة؟", options: ["اليورو", "الدولار", "الجنيه الإسترليني", "الفرنك"], answer: 2 },
            { question: "من هو مخترع المصباح الكهربائي؟", options: ["نيوتن", "أديسون", "أينشتاين", "تسلا"], answer: 1 },
            { question: "ما هو أكبر محيط في العالم؟", options: ["الأطلسي", "الهندي", "الهادئ", "المتجمد الشمالي"], answer: 2 },
            { question: "كم عدد عظام جسم الإنسان البالغ؟", options: ["196", "206", "216", "300"], answer: 1 },
            { question: "ما هي اللغة الأكثر تحدثاً في العالم؟", options: ["الإنجليزية", "الإسبانية", "الصينية (الماندرين)", "العربية"], answer: 2 },
            { question: "في أي قارة تقع مصر؟", options: ["آسيا", "أفريقيا", "أوروبا", "أستراليا"], answer: 1 },
            { question: "ما هو الكوكب الأحمر؟", options: ["الزهرة", "المريخ", "المشتري", "زحل"], answer: 1 },
            { question: "ما هي أعلى قمة جبلية في العالم؟", options: ["كي 2", "إيفرست", "كليمنجارو", "مونت بلان"], answer: 1 }
        ],
        // LEVEL 3
        [
            { question: "من كتب رواية 'البؤساء'؟", options: ["فيكتور هوغو", "تشارلز ديكنز", "تولستوي", "همنغواي"], answer: 0 },
            { question: "ما هو الغاز الأكثر وفرة في الغلاف الجوي للأرض؟", options: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الهيدروجين"], answer: 2 },
            { question: "في أي عام هبط الإنسان على القمر لأول مرة؟", options: ["1965", "1969", "1972", "1959"], answer: 1 },
            { question: "ما هي عاصمة أستراليا؟", options: ["سيدني", "ملبورن", "كانبيرا", "بيرث"], answer: 2 },
            { question: "كم عدد أوتار جسم القلب (حجراته)؟", options: ["2", "3", "4", "5"], answer: 2 },
            { question: "من هو مؤسس شركة مايكروسوفت؟", options: ["ستيف جوبز", "بيل غيتس", "مارك زوكربيرغ", "إيلون ماسك"], answer: 1 },
            { question: "ما هو المعدن السائل في درجة حرارة الغرفة؟", options: ["الرصاص", "الزئبق", "الألمنيوم", "الفضة"], answer: 1 },
            { question: "أي حضارة بنت الأهرامات؟", options: ["الرومانية", "اليونانية", "المصرية القديمة", "البابلية"], answer: 2 },
            { question: "ما هي سرعة الضوء تقريباً؟", options: ["300 ألف كم/ث", "150 ألف كم/ث", "1000 كم/ث", "30 ألف كم/ث"], answer: 0 },
            { question: "ما هو أكبر عضو في جسم الإنسان؟", options: ["الكبد", "الجلد", "الرئة", "الدماغ"], answer: 1 }
        ]
    ],
    science: [
        // LEVEL 1
        [
            { question: "ما هو الرمز الكيميائي للماء؟", options: ["CO2", "H2O", "O2", "NaCl"], answer: 1 },
            { question: "كم عدد الكواكب في المجموعة الشمسية؟", options: ["7", "8", "9", "10"], answer: 1 },
            { question: "ما هي وحدة قياس القوة؟", options: ["الجول", "الواط", "النيوتن", "الباسكال"], answer: 2 },
            { question: "أي جزء من الخلية يُسمى مركز الطاقة؟", options: ["النواة", "الميتوكوندريا", "الريبوسوم", "الغشاء"], answer: 1 },
            { question: "ما هو أقرب كوكب للشمس؟", options: ["الزهرة", "عطارد", "الأرض", "المريخ"], answer: 1 },
            { question: "ما الغاز الذي تطلقه النباتات في النهار؟", options: ["ثاني أكسيد الكربون", "النيتروجين", "الأكسجين", "الهيدروجين"], answer: 2 },
            { question: "ما هي درجة غليان الماء عند مستوى سطح البحر؟", options: ["90°", "100°", "110°", "120°"], answer: 1 },
            { question: "ما العنصر الأكثر وفرة في الكون؟", options: ["الأكسجين", "الكربون", "الهيدروجين", "الحديد"], answer: 2 },
            { question: "ما هي القوة التي تجذب الأجسام نحو الأرض؟", options: ["المغناطيسية", "الجاذبية", "الاحتكاك", "الكهرباء"], answer: 1 },
            { question: "كم عدد الحواس الأساسية للإنسان؟", options: ["3", "4", "5", "6"], answer: 2 }
        ],
        // LEVEL 2
        [
            { question: "ما هي سرعة الصوت في الهواء تقريباً؟", options: ["340 م/ث", "150 م/ث", "1000 م/ث", "3000 م/ث"], answer: 0 },
            { question: "ما هو العضو المسؤول عن ضخ الدم؟", options: ["الكبد", "الرئة", "القلب", "الكلية"], answer: 2 },
            { question: "ما هي أصغر وحدة في الكائن الحي؟", options: ["النسيج", "الخلية", "العضو", "الجزيء"], answer: 1 },
            { question: "أي فيتامين تنتجه البشرة بفعل الشمس؟", options: ["A", "C", "D", "B12"], answer: 2 },
            { question: "ما هو المعدن الأكثر صلابة في الطبيعة؟", options: ["الحديد", "الذهب", "الألماس", "البلاتين"], answer: 2 },
            { question: "ما العملية التي تصنع بها النباتات غذاءها؟", options: ["التنفس", "البناء الضوئي", "التخمر", "النتح"], answer: 1 },
            { question: "كم عدد الكروموسومات في خلية الإنسان؟", options: ["23", "44", "46", "48"], answer: 2 },
            { question: "ما هو الكوكب المعروف بحلقاته؟", options: ["المشتري", "زحل", "أورانوس", "نبتون"], answer: 1 },
            { question: "ما الوحدة المستخدمة لقياس التيار الكهربائي؟", options: ["الفولت", "الأوم", "الأمبير", "الواط"], answer: 2 },
            { question: "ما الغاز المسؤول عن الاحتباس الحراري بشكل رئيسي؟", options: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الأرغون"], answer: 1 }
        ]
    ],
    history: [
        // LEVEL 1
        [
            { question: "في أي عام انتهت الحرب العالمية الثانية؟", options: ["1943", "1945", "1947", "1950"], answer: 1 },
            { question: "من هو أول خليفة في الإسلام؟", options: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب"], answer: 1 },
            { question: "أي حضارة اشتهرت بالكتابة المسمارية؟", options: ["المصرية", "الإغريقية", "السومرية", "الرومانية"], answer: 2 },
            { question: "من اكتشف أمريكا عام 1492؟", options: ["ماجلان", "كولومبوس", "ماركو بولو", "فاسكو دا جاما"], answer: 1 },
            { question: "ما هي أقدم حضارة عرفها التاريخ؟", options: ["الفرعونية", "بلاد الرافدين", "الصينية", "الإغريقية"], answer: 1 },
            { question: "في أي مدينة بدأت الثورة الفرنسية؟", options: ["ليون", "مرسيليا", "باريس", "نيس"], answer: 2 },
            { question: "من هو القائد الذي فتح القسطنطينية؟", options: ["صلاح الدين", "محمد الفاتح", "هارون الرشيد", "طارق بن زياد"], answer: 1 },
            { question: "كم استمرت حرب المئة عام تقريباً؟", options: ["100 سنة", "116 سنة", "50 سنة", "75 سنة"], answer: 1 },
            { question: "من بنى سور الصين العظيم بشكل رئيسي؟", options: ["اليابانيون", "المغول", "الصينيون", "الكوريون"], answer: 2 },
            { question: "في أي عام سقط جدار برلين؟", options: ["1987", "1989", "1991", "1985"], answer: 1 }
        ],
        // LEVEL 2
        [
            { question: "من هو القائد المسلم الذي حرر القدس من الصليبيين؟", options: ["خالد بن الوليد", "صلاح الدين الأيوبي", "نور الدين زنكي", "قطز"], answer: 1 },
            { question: "أي إمبراطورية حكمها أغسطس قيصر؟", options: ["اليونانية", "الرومانية", "الفارسية", "العثمانية"], answer: 1 },
            { question: "متى بدأت الحرب العالمية الأولى؟", options: ["1912", "1914", "1916", "1918"], answer: 1 },
            { question: "من قاد معركة حطين؟", options: ["صلاح الدين", "بيبرس", "المعتصم", "هولاكو"], answer: 0 },
            { question: "ما اسم المعركة التي أوقفت الزحف المغولي؟", options: ["اليرموك", "عين جالوت", "بدر", "القادسية"], answer: 1 },
            { question: "من أول إنسان صعد إلى الفضاء؟", options: ["نيل أرمسترونغ", "يوري غاغارين", "غاغارين باز", "جون غلين"], answer: 1 },
            { question: "أي دولة كانت تُعرف ببلاد فارس؟", options: ["العراق", "إيران", "تركيا", "أفغانستان"], answer: 1 },
            { question: "في أي قرن ظهرت الدولة العباسية؟", options: ["السابع الميلادي", "الثامن الميلادي", "التاسع الميلادي", "العاشر الميلادي"], answer: 1 },
            { question: "من هو مؤسس الدولة الأموية؟", options: ["معاوية بن أبي سفيان", "عبد الملك بن مروان", "الوليد بن عبد الملك", "يزيد"], answer: 0 },
            { question: "ما اسم السفينة التي غرقت عام 1912؟", options: ["لوزيتانيا", "تايتانيك", "بسمارك", "كوين ماري"], answer: 1 }
        ]
    ],
    islamic: [
        // LEVEL 1
        [
            { question: "كم عدد أركان الإسلام؟", options: ["4", "5", "6", "7"], answer: 1 },
            { question: "كم عدد سور القرآن الكريم؟", options: ["110", "114", "120", "100"], answer: 1 },
            { question: "ما هي أطول سورة في القرآن؟", options: ["آل عمران", "البقرة", "النساء", "المائدة"], answer: 1 },
            { question: "في أي شهر يصوم المسلمون؟", options: ["شعبان", "رجب", "رمضان", "شوال"], answer: 2 },
            { question: "كم عدد الصلوات المفروضة في اليوم؟", options: ["3", "4", "5", "6"], answer: 2 },
            { question: "ما هي القبلة التي يتوجه إليها المسلمون؟", options: ["المسجد الأقصى", "الكعبة", "المسجد النبوي", "جبل عرفة"], answer: 1 },
            { question: "من هو خاتم الأنبياء؟", options: ["عيسى", "موسى", "محمد ﷺ", "إبراهيم"], answer: 2 },
            { question: "كم عدد أركان الإيمان؟", options: ["5", "6", "7", "4"], answer: 1 },
            { question: "ما أول سورة في القرآن الكريم؟", options: ["البقرة", "الفاتحة", "الإخلاص", "الناس"], answer: 1 },
            { question: "في أي مدينة وُلد النبي محمد ﷺ؟", options: ["المدينة", "مكة", "الطائف", "القدس"], answer: 1 }
        ],
        // LEVEL 2
        [
            { question: "كم عدد أجزاء القرآن الكريم؟", options: ["20", "30", "40", "60"], answer: 1 },
            { question: "ما اسم الغار الذي نزل فيه الوحي أول مرة؟", options: ["ثور", "حراء", "أحد", "بدر"], answer: 1 },
            { question: "من هي أول امرأة آمنت بالنبي ﷺ؟", options: ["عائشة", "خديجة", "فاطمة", "أم سلمة"], answer: 1 },
            { question: "ما اسم أول غزوة في الإسلام؟", options: ["أحد", "بدر", "الخندق", "حنين"], answer: 1 },
            { question: "كم عدد الأنبياء المذكورين بالاسم في القرآن؟", options: ["20", "25", "30", "15"], answer: 1 },
            { question: "ما هي السورة التي تعدل ثلث القرآن؟", options: ["الفاتحة", "الإخلاص", "الكوثر", "يس"], answer: 1 },
            { question: "إلى أي مدينة هاجر النبي ﷺ؟", options: ["الطائف", "المدينة", "مكة", "خيبر"], answer: 1 },
            { question: "من هو الصحابي الملقب بسيف الله المسلول؟", options: ["خالد بن الوليد", "عمر بن الخطاب", "سعد بن أبي وقاص", "أبو عبيدة"], answer: 0 },
            { question: "ما اسم الكتاب الذي أُنزل على موسى عليه السلام؟", options: ["الإنجيل", "الزبور", "التوراة", "الصحف"], answer: 2 },
            { question: "كم عدد التكبيرات في صلاة العيد (الركعة الأولى)؟", options: ["3", "5", "7", "4"], answer: 2 }
        ]
    ],
    sports: [
        // LEVEL 1
        [
            { question: "كم عدد لاعبي فريق كرة القدم في الملعب؟", options: ["9", "10", "11", "12"], answer: 2 },
            { question: "كل كم سنة تُقام كأس العالم لكرة القدم؟", options: ["سنتان", "3 سنوات", "4 سنوات", "5 سنوات"], answer: 2 },
            { question: "في أي رياضة يوجد مصطلح 'سلام دانك'؟", options: ["كرة القدم", "كرة السلة", "التنس", "الكرة الطائرة"], answer: 1 },
            { question: "كم عدد الأشواط في مباراة كرة القدم؟", options: ["1", "2", "3", "4"], answer: 1 },
            { question: "أي دولة فازت بأكبر عدد من كؤوس العالم؟", options: ["ألمانيا", "البرازيل", "إيطاليا", "الأرجنتين"], answer: 1 },
            { question: "كم لاعباً في فريق كرة السلة على الأرض؟", options: ["5", "6", "7", "4"], answer: 0 },
            { question: "ما هي الرياضة الملكية المرتبطة بالخيول؟", options: ["الجولف", "الفروسية", "البولو", "التجديف"], answer: 1 },
            { question: "أين أُقيمت أول دورة ألعاب أولمبية حديثة؟", options: ["باريس", "أثينا", "لندن", "روما"], answer: 1 },
            { question: "كم مدة الشوط في كرة القدم؟", options: ["30 دقيقة", "45 دقيقة", "60 دقيقة", "40 دقيقة"], answer: 1 },
            { question: "في أي رياضة يُستخدم مضرب وكرة صفراء صغيرة؟", options: ["الإسكواش", "التنس", "البادل", "الريشة"], answer: 1 }
        ],
        // LEVEL 2
        [
            { question: "كم عدد الجولات القصوى في نزال الملاكمة المحترفة؟", options: ["10", "12", "15", "8"], answer: 1 },
            { question: "ما البلد المضيف لكأس العالم 2022؟", options: ["روسيا", "قطر", "البرازيل", "أمريكا"], answer: 1 },
            { question: "كم نقطة تساوي الثلاثية في كرة السلة؟", options: ["2", "3", "1", "4"], answer: 1 },
            { question: "من يُلقب بـ'الأسطورة' في كرة القدم الأرجنتينية؟", options: ["بيليه", "مارادونا", "كرويف", "زيدان"], answer: 1 },
            { question: "كم عدد لاعبي فريق الكرة الطائرة في الملعب؟", options: ["5", "6", "7", "8"], answer: 1 },
            { question: "ما الرياضة التي يُمارَس فيها 'الماراثون'؟", options: ["السباحة", "الجري", "الدراجات", "التجديف"], answer: 1 },
            { question: "كم المسافة الرسمية لسباق الماراثون تقريباً؟", options: ["21 كم", "42 كم", "50 كم", "30 كم"], answer: 1 },
            { question: "أي نادٍ يُلقب بـ'البلوغرانا'؟", options: ["ريال مدريد", "برشلونة", "يوفنتوس", "ميلان"], answer: 1 },
            { question: "في أي رياضة يوجد 'حكم الفيديو VAR'؟", options: ["كرة السلة", "كرة القدم", "التنس", "الهوكي"], answer: 1 },
            { question: "كم عدد الحلقات في شعار الأولمبياد؟", options: ["4", "5", "6", "7"], answer: 1 }
        ]
    ]
};

// State Variables
let currentCategory = '';
let currentLevel = 0;
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 15;
let timerInterval;
let canAnswer = true;
let currentQuestions = []; // shuffled questions for the active level
let streak = 0;            // consecutive correct answers in the current quiz
let fastAnswers = 0;       // answers given with plenty of time left (speed bonus)
let answers = [];          // per-question record for end-of-quiz review
let lastReview = [];       // snapshot of answers for the review screen
let lastResult = null;     // { score, total, category, level, stars } for sharing
let fiftyUsed = false;     // 50:50 lifeline used this level

const PASS_THRESHOLD = 7; // out of 10 to advance
const QUESTION_TIME = 15;
const FAST_ANSWER_THRESHOLD = 10; // seconds remaining to count as a "fast" answer

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const resultStars = document.getElementById('result-stars');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerDisplay = document.getElementById('time-left');
const timerRing = document.getElementById('timer-ring');
const timerRingProgress = document.getElementById('timer-ring-progress');
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 20; // r=20 in the SVG
const progressBar = document.getElementById('progress-bar');
const currentQDisplay = document.getElementById('current-q');
const totalQDisplay = document.getElementById('total-q');
const finalScoreDisplay = document.getElementById('final-score');
const maxScoreDisplay = document.getElementById('max-score');
const resultMessage = document.getElementById('result-message');
const resultIcon = document.getElementById('result-icon');
const streakBadge = document.getElementById('streak-badge');
const xpReward = document.getElementById('xp-reward');

// ── Progress persistence (localStorage) ──
function progressKey(cat) { return `quiz_progress_${cat}`; }
function bestScoreKey(cat) { return `quiz_best_${cat}`; }
const SOUND_KEY = 'quiz_sound_enabled';

function getUnlockedLevel(cat) {
    const v = parseInt(localStorage.getItem(progressKey(cat)), 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
}

function unlockLevel(cat, level) {
    if (level > getUnlockedLevel(cat)) {
        localStorage.setItem(progressKey(cat), String(level));
    }
}

function getBestScore(cat) {
    const v = parseInt(localStorage.getItem(bestScoreKey(cat)), 10);
    return Number.isFinite(v) ? v : 0;
}

function saveBestScore(cat, value) {
    if (value > getBestScore(cat)) {
        localStorage.setItem(bestScoreKey(cat), String(value));
    }
}

// Per-level best score (independent of overall category best)
function levelBestKey(cat, lvl) { return `quiz_lvlbest_${cat}_${lvl}`; }

function getLevelBest(cat, lvl) {
    const v = parseInt(localStorage.getItem(levelBestKey(cat, lvl)), 10);
    return Number.isFinite(v) ? v : 0;
}

function saveLevelBest(cat, lvl, value) {
    if (value > getLevelBest(cat, lvl)) {
        localStorage.setItem(levelBestKey(cat, lvl), String(value));
    }
}

// Stars earned for a score out of 10: 7-8 ⭐, 9 ⭐⭐, 10 ⭐⭐⭐
function starsFor(score) {
    if (score >= 10) return 3;
    if (score >= 9) return 2;
    if (score >= PASS_THRESHOLD) return 1;
    return 0;
}

// ── Player identity ──
const PLAYER_KEY = 'quiz_player_name';
function getPlayerName() { return localStorage.getItem(PLAYER_KEY) || ''; }
function setPlayerName(name) {
    const clean = String(name || '').trim().slice(0, 20);
    if (clean) localStorage.setItem(PLAYER_KEY, clean);
    return clean;
}

// ── Local leaderboard (works offline; no backend required) ──
const LEADERBOARD_KEY = 'quiz_leaderboard_local';

function getLeaderboard() {
    try {
        const arr = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}

function saveLocalScore(entry) {
    const board = getLeaderboard();
    board.push(entry);
    // Sort by score desc, then most recent first; keep top 50
    board.sort((a, b) => (b.score - a.score) || (b.ts - a.ts));
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board.slice(0, 50)));
}

// ── XP & Ranks ──
const XP_KEY = 'quiz_xp';
const RANKS = [
    { min: 0,    name: 'مبتدئ',  icon: '🌱' },
    { min: 100,  name: 'متعلّم', icon: '📘' },
    { min: 300,  name: 'متقدّم', icon: '⚡' },
    { min: 700,  name: 'خبير',   icon: '🎯' },
    { min: 1500, name: 'محترف',  icon: '🏅' },
    { min: 3000, name: 'النخبة', icon: '👑' }
];

function getXP() {
    const v = parseInt(localStorage.getItem(XP_KEY), 10);
    return Number.isFinite(v) ? v : 0;
}

function addXP(amount) {
    localStorage.setItem(XP_KEY, String(getXP() + Math.max(0, amount)));
}

// Returns { icon, name, current, into, span, next } describing rank + progress
function getRank(xp) {
    xp = (typeof xp === 'number') ? xp : getXP();
    let idx = 0;
    for (let i = 0; i < RANKS.length; i++) {
        if (xp >= RANKS[i].min) idx = i;
    }
    const current = RANKS[idx];
    const next = RANKS[idx + 1] || null;
    return {
        icon: current.icon,
        name: current.name,
        xp,
        into: xp - current.min,                    // XP earned within current rank
        span: next ? next.min - current.min : 0,    // XP needed to reach next rank
        next: next ? next.name : null,
        nextMin: next ? next.min : null,
        isMax: !next
    };
}

// First-clear tracking so XP rewards genuine progress, not endless farming
function clearedKey(cat, lvl) { return `quiz_cleared_${cat}_${lvl}`; }
function isCleared(cat, lvl) { return localStorage.getItem(clearedKey(cat, lvl)) === '1'; }
function markCleared(cat, lvl) { localStorage.setItem(clearedKey(cat, lvl), '1'); }

function resetProgress() {
    Object.keys(quizDatabase).forEach(cat => {
        localStorage.removeItem(progressKey(cat));
        localStorage.removeItem(bestScoreKey(cat));
        for (let l = 0; l < quizDatabase[cat].length; l++) {
            localStorage.removeItem(levelBestKey(cat, l));
            localStorage.removeItem(clearedKey(cat, l));
        }
    });
    localStorage.removeItem(XP_KEY);
    localStorage.removeItem(LEADERBOARD_KEY);
}

// ── Sound engine (Web Audio API — no external files, works offline) ──
function isSoundEnabled() {
    return localStorage.getItem(SOUND_KEY) !== 'false'; // default ON
}

function setSoundEnabled(on) {
    localStorage.setItem(SOUND_KEY, on ? 'true' : 'false');
}

let audioCtx = null;
function playSound(type) {
    if (!isSoundEnabled()) return;
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        // tone presets: [frequencies], duration, wave
        const presets = {
            correct: { freqs: [523.25, 783.99], dur: 0.18, wave: 'sine' },   // C5 → G5
            wrong:   { freqs: [196.00, 138.59], dur: 0.30, wave: 'sawtooth' }, // G3 → C#3
            click:   { freqs: [440.00], dur: 0.06, wave: 'triangle' }
        };
        const p = presets[type] || presets.click;
        p.freqs.forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = p.wave;
            const t = now + i * (p.dur / p.freqs.length);
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + p.dur / p.freqs.length);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + p.dur / p.freqs.length);
        });
    } catch (e) {
        /* audio unavailable — fail silently */
    }
}

// ── Celebration helpers (confetti + animated score count-up) ──
function launchConfetti(intense) {
    if (typeof document.createElement !== 'function' || !document.body) return;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#fbbf24', '#22c55e'];
    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    const count = intense ? 90 : 55;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.left = Math.random() * 100 + '%';
        p.style.background = colors[i % colors.length];
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        p.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
        p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        p.style.setProperty('--drift', (Math.random() * 140 - 70) + 'px');
        layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3800);
}

function countUp(el, to, dur) {
    if (!el) return;
    dur = dur || 700;
    if (typeof requestAnimationFrame !== 'function' || typeof performance === 'undefined') {
        el.textContent = to; // non-browser / no rAF → set directly
        return;
    }
    const start = performance.now();
    (function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = Math.round(eased * to);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = to;
    })(start);
}

// Public API for the UI layer (mobile nav, settings, sound toggle)
window.QuizApp = {
    categories: () => Object.keys(quizDatabase),
    totalLevels: (cat) => (quizDatabase[cat] ? quizDatabase[cat].length : 0),
    getUnlockedLevel,
    getBestScore,
    getLevelBest,
    starsFor,
    getXP,
    getRank,
    getPlayerName,
    setPlayerName,
    getLeaderboard,
    totalQuestions: () => Object.values(quizDatabase).reduce((sum, cat) => sum + cat.reduce((s, l) => s + l.length, 0), 0),
    getLastReview: () => lastReview.slice(),
    getLastResult: () => lastResult,
    categoryLabel: (cat) => (CATEGORY_META[cat] ? CATEGORY_META[cat].label : cat),
    categoryColor: (cat) => (CATEGORY_META[cat] ? CATEGORY_META[cat].color : null),
    resetTheme: () => applyCategoryTheme(null),
    resetProgress,
    isSoundEnabled,
    setSoundEnabled,
    playSound
};

// Fisher–Yates shuffle that keeps the correct answer index in sync
function shuffleQuestion(q) {
    const indices = q.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return {
        question: q.question,
        options: indices.map(i => q.options[i]),
        answer: indices.indexOf(q.answer)
    };
}

// Category labels for screens rendered from JS
const CATEGORY_META = {
    programming: { label: 'أسئلة البرمجة', icon: 'fas fa-code',          color: '#6366f1', glow: 'rgba(99, 102, 241, 0.45)' },
    general:     { label: 'ثقافة عامة',    icon: 'fas fa-earth-americas', color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
    science:     { label: 'العلوم',        icon: 'fas fa-flask',          color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
    history:     { label: 'التاريخ',       icon: 'fas fa-landmark',       color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)' },
    islamic:     { label: 'إسلاميات',      icon: 'fas fa-mosque',         color: '#22c55e', glow: 'rgba(34, 197, 94, 0.45)' },
    sports:      { label: 'رياضة',         icon: 'fas fa-futbol',         color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)' }
};

// Apply the active category's accent color across themed screens
function applyCategoryTheme(category) {
    const meta = CATEGORY_META[category];
    const root = document.documentElement;
    if (!root || !root.style) return;
    if (meta) {
        root.style.setProperty('--cat-accent', meta.color);
        root.style.setProperty('--cat-glow', meta.glow);
    } else {
        root.style.removeProperty('--cat-accent');
        root.style.removeProperty('--cat-glow');
    }
}

// Global Function for selection → now opens the level-select screen
window.selectCategory = function (category) {
    if (!quizDatabase[category]) return;
    currentCategory = category;
    applyCategoryTheme(category);
    openLevelSelect(category);
};

// Start a specific level directly
window.startLevel = function (category, level) {
    if (!quizDatabase[category] || !quizDatabase[category][level]) return;
    // Guard: don't allow starting a locked level
    if (level > getUnlockedLevel(category)) return;
    currentCategory = category;
    currentLevel = level;
    applyCategoryTheme(category);
    startQuiz();
};

function openLevelSelect(category) {
    const screen = document.getElementById('level-screen');
    if (!screen) { // graceful fallback if HTML not present
        currentLevel = 0;
        startQuiz();
        return;
    }
    const meta = CATEGORY_META[category] || { label: category, icon: 'fas fa-layer-group' };
    const titleEl = document.getElementById('level-title');
    if (titleEl) titleEl.innerHTML = `<i class="${meta.icon}"></i> ${meta.label}`;

    const grid = document.getElementById('level-grid');
    const unlocked = getUnlockedLevel(category);
    const total = quizDatabase[category].length;
    grid.innerHTML = '';

    for (let l = 0; l < total; l++) {
        const isLocked = l > unlocked;
        const best = getLevelBest(category, l);
        const stars = starsFor(best);
        const tile = document.createElement('button');
        tile.className = 'level-tile' + (isLocked ? ' locked' : '') + (stars > 0 ? ' done' : '');
        tile.disabled = isLocked;
        const starHTML = [0, 1, 2].map(i =>
            `<i class="fas fa-star ${i < stars ? 'on' : ''}"></i>`).join('');
        tile.innerHTML = isLocked
            ? `<i class="fas fa-lock lock-icon"></i><span class="level-num">${l + 1}</span>`
            : `<span class="level-num">${l + 1}</span><div class="level-stars">${starHTML}</div>`;
        if (!isLocked) tile.addEventListener('click', () => startLevel(category, l));
        grid.appendChild(tile);
    }

    // Switch screens
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    screen.classList.add('active');
}

// Event Listeners
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        showLevelComplete();
    }
});

restartBtn.addEventListener('click', () => {
    startQuiz();
});

// Functions
function updateStreakBadge() {
    if (!streakBadge) return;
    if (streak >= 2) {
        streakBadge.innerHTML = `<i class="fas fa-fire"></i> ${streak}`;
        streakBadge.classList.add('show');
    } else {
        streakBadge.classList.remove('show');
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    streak = 0;
    fastAnswers = 0;
    answers = [];
    fiftyUsed = false;
    updateStreakBadge();

    // Build a shuffled copy of the current level's questions
    const levelQuestions = quizDatabase[currentCategory][currentLevel] || [];
    currentQuestions = levelQuestions.map(shuffleQuestion);

    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    quizScreen.classList.add('active');

    totalQDisplay.textContent = currentQuestions.length;
    showQuestion();
}

function showQuestion() {
    canAnswer = true;
    timeLeft = QUESTION_TIME;
    nextBtn.disabled = true;
    timerDisplay.textContent = timeLeft;

    const q = currentQuestions[currentQuestionIndex];

    questionText.textContent = q.question;
    currentQDisplay.textContent = currentQuestionIndex + 1;

    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    optionsContainer.innerHTML = '';
    q.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.style.animationDelay = (index * 0.07) + 's'; // staggered entrance
        div.innerHTML = `<span>${option}</span><i class="far fa-circle"></i>`;
        div.addEventListener('click', () => selectOption(index, div));
        optionsContainer.appendChild(div);
    });

    // Animate the question text in too
    if (questionText) {
        questionText.style.animation = 'none';
        void questionText.getBoundingClientRect?.();
        questionText.style.animation = '';
    }

    // Reset the 50:50 lifeline button state for this question
    const fiftyBtn = document.getElementById('fifty-btn');
    if (fiftyBtn) fiftyBtn.disabled = fiftyUsed;

    startTimer();
}

// 50:50 lifeline — removes two wrong options. One use per level.
window.useFifty = function () {
    if (fiftyUsed || !canAnswer) return;
    fiftyUsed = true;
    const fiftyBtn = document.getElementById('fifty-btn');
    if (fiftyBtn) fiftyBtn.disabled = true;
    playSound('click');

    const correctIndex = currentQuestions[currentQuestionIndex].answer;
    const wrongIndices = [];
    Array.from(optionsContainer.children).forEach((opt, i) => {
        if (i !== correctIndex) wrongIndices.push(i);
    });
    // Shuffle wrong indices, eliminate two of them
    for (let i = wrongIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]];
    }
    wrongIndices.slice(0, 2).forEach(i => {
        const opt = optionsContainer.children[i];
        opt.classList.add('eliminated');
        opt.style.pointerEvents = 'none';
    });
};

function updateTimerRing(instant) {
    if (!timerRingProgress) return;
    timerRingProgress.style.strokeDasharray = String(TIMER_CIRCUMFERENCE);
    // Reset to full instantly (no backward sweep) at the start of a question
    if (instant) {
        const prev = timerRingProgress.style.transition;
        timerRingProgress.style.transition = 'none';
        timerRingProgress.style.strokeDashoffset = '0';
        // Force reflow so the 'none' transition takes effect before re-enabling
        void timerRingProgress.getBoundingClientRect?.();
        timerRingProgress.style.transition = prev || '';
    }
    const fraction = Math.max(0, timeLeft / QUESTION_TIME);
    timerRingProgress.style.strokeDashoffset = String(TIMER_CIRCUMFERENCE * (1 - fraction));
    // Color shifts: green → amber → red as time runs out
    let stroke = 'var(--secondary)';
    if (timeLeft <= 5) stroke = 'var(--error)';
    else if (timeLeft <= 9) stroke = '#f59e0b';
    timerRingProgress.style.stroke = stroke;
    if (timerRing) timerRing.classList.toggle('low', timeLeft <= 5);
}

function startTimer() {
    clearInterval(timerInterval);
    updateTimerRing(true);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        updateTimerRing();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            autoHandleTimeout();
        }
    }, 1000);
}

function selectOption(index, element) {
    if (!canAnswer) return;

    clearInterval(timerInterval);
    canAnswer = false;
    const q = currentQuestions[currentQuestionIndex];
    const correctIndex = q.answer;
    answers.push({ question: q.question, options: q.options, correct: correctIndex, chosen: index });

    if (index === correctIndex) {
        score++;
        streak++;
        if (timeLeft >= FAST_ANSWER_THRESHOLD) fastAnswers++;
        element.classList.add('correct');
        element.querySelector('i').className = 'fas fa-check-circle';
        playSound('correct');
    } else {
        streak = 0;
        element.classList.add('wrong');
        element.querySelector('i').className = 'fas fa-times-circle';
        optionsContainer.children[correctIndex].classList.add('correct');
        optionsContainer.children[correctIndex].querySelector('i').className = 'fas fa-check-circle';
        playSound('wrong');
    }
    updateStreakBadge();

    Array.from(optionsContainer.children).forEach(opt => opt.classList.add('disabled'));
    nextBtn.disabled = false;
}

function autoHandleTimeout() {
    canAnswer = false;
    streak = 0;
    updateStreakBadge();
    playSound('wrong');
    const q = currentQuestions[currentQuestionIndex];
    const correctIndex = q.answer;
    answers.push({ question: q.question, options: q.options, correct: correctIndex, chosen: -1 });
    optionsContainer.children[correctIndex].classList.add('correct');
    optionsContainer.children[correctIndex].querySelector('i').className = 'fas fa-check-circle';
    Array.from(optionsContainer.children).forEach(opt => opt.classList.add('disabled'));
    nextBtn.disabled = false;
}

async function showLevelComplete() {
    clearInterval(timerInterval);
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
    countUp(finalScoreDisplay, score);
    maxScoreDisplay.textContent = `/ ${currentQuestions.length}`;
    saveBestScore(currentCategory, score);
    saveLevelBest(currentCategory, currentLevel, score);

    // Dynamic result icon + celebration by performance tier
    const perfect = score >= currentQuestions.length;
    const passed = score >= PASS_THRESHOLD;
    if (resultIcon) {
        const icon = perfect ? 'fa-crown' : (passed ? 'fa-trophy' : 'fa-face-sad-tear');
        resultIcon.innerHTML = `<i class="fas ${icon}"></i>`;
        resultIcon.classList.toggle('perfect', perfect);
        resultIcon.classList.toggle('lose', !passed);
    }
    if (passed) launchConfetti(perfect);

    // Snapshot data for the review screen and share button
    lastReview = answers.slice();
    lastResult = {
        score,
        total: currentQuestions.length,
        category: currentCategory,
        level: currentLevel + 1,
        stars: starsFor(score)
    };

    // Show earned stars on the result screen
    if (resultStars) {
        const stars = starsFor(score);
        resultStars.innerHTML = [0, 1, 2].map(i =>
            `<i class="fas fa-star ${i < stars ? 'on' : ''}"></i>`).join('');
    }

    // ── Award XP ──
    // Full reward on first clear; reduced reward on replays (so XP tracks real progress).
    const firstClear = score >= PASS_THRESHOLD && !isCleared(currentCategory, currentLevel);
    let xpGain = 0;
    if (firstClear) {
        xpGain = score * 10 + fastAnswers * 5 + 50;           // base + speed bonus + first-clear bonus
        if (score >= currentQuestions.length) xpGain += 30;   // perfect-score bonus
        markCleared(currentCategory, currentLevel);
    } else {
        xpGain = score * 2 + fastAnswers * 2;                  // small replay reward
    }
    const rankBefore = getRank();
    addXP(xpGain);
    const rankAfter = getRank();

    if (xpReward) {
        const ranked = rankAfter.name !== rankBefore.name
            ? ` · <b>ترقية إلى ${rankAfter.icon} ${rankAfter.name}!</b>`
            : '';
        xpReward.innerHTML = `<i class="fas fa-bolt"></i> +${xpGain} XP${ranked}`;
    }

    // Save to leaderboard using the logged-in player name (no prompt)
    const playerName = getPlayerName() || 'لاعب';
    saveLocalScore({
        name: playerName,
        score,
        total: currentQuestions.length,
        category: currentCategory,
        level: currentLevel + 1,
        ts: Date.now()
    });
    saveHighScore(playerName, score, currentCategory, currentLevel + 1); // best-effort online sync

    const totalLevels = quizDatabase[currentCategory].length;
    const isLastLevel = currentLevel + 1 >= totalLevels;

    // "اختر مستوى" always returns to the level grid for this category
    homeBtn.textContent = "اختيار المستوى";
    homeBtn.onclick = () => openLevelSelect(currentCategory);

    if (score >= PASS_THRESHOLD) {
        // Unlock the next level for this category
        unlockLevel(currentCategory, currentLevel + 1);

        if (isLastLevel) {
            resultMessage.innerHTML = `🏆 مذهل! لقد أكملت <b>جميع المستويات المتوفرة</b> في هذا التصنيف!`;
            restartBtn.textContent = "اختيار المستوى";
            restartBtn.onclick = () => openLevelSelect(currentCategory);
        } else {
            resultMessage.innerHTML = `مستوى رائع! لقد أكملت <b>المستوى ${currentLevel + 1}</b> بنجاح. هل أنت جاهز للمستوى التالي؟`;
            restartBtn.textContent = "المستوى التالي";
            restartBtn.onclick = () => startLevel(currentCategory, currentLevel + 1);
        }
    } else {
        resultMessage.innerHTML = `نقاطك غير كافية للمرور (تحتاج ${PASS_THRESHOLD}/${currentQuestions.length}). حاول مرة أخرى!`;
        restartBtn.textContent = "إعادة المحاولة";
        restartBtn.onclick = () => startQuiz();
    }
}

async function saveHighScore(name, score, cat, lvl) {
    try {
        if (typeof supabaseClient !== 'undefined') {
            await supabaseClient.from('quiz_leaderboard').insert([
                { player_name: name, score: score, category: cat, level: lvl }
            ]);
            console.log("Score saved to Supabase");
        }
    } catch (e) {
        console.warn("Failed to save score:", e);
    }
}
