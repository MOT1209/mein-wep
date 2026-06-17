import 'package:flutter/material.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/achievement.dart';
import '../../domain/entities/article.dart';
import '../../domain/entities/community.dart';
import '../../domain/entities/course.dart';
import '../../domain/entities/quiz.dart';

/// بيانات أولية (Seed) تمثّل قاعدة بيانات المحتوى.
/// مفصولة عن المنطق ليسهل استبدالها بمصدر شبكي.
class SeedData {
  SeedData._();

  static List<Article> articles() => [
        Article(
          id: 'a1',
          categoryId: ContentCategory.ai.id,
          title: 'مقدمة في الذكاء الاصطناعي',
          summary: 'ما هو الذكاء الاصطناعي وكيف يغيّر حياتنا اليومية؟',
          tags: const ['AI', 'مقدمة', 'تعلم الآلة'],
          readMinutes: 5,
          views: 1280,
          likes: 240,
          content:
              'الذكاء الاصطناعي (AI) هو فرع من علوم الحاسب يهدف إلى بناء أنظمة قادرة على أداء مهام تتطلب ذكاءً بشرياً، '
              'مثل الفهم اللغوي والتعرف على الصور واتخاذ القرار.\n\n'
              'تشمل مجالاته: تعلّم الآلة (Machine Learning) حيث تتعلم الأنظمة من البيانات، '
              'والتعلّم العميق (Deep Learning) المعتمد على الشبكات العصبية، ومعالجة اللغة الطبيعية (NLP).\n\n'
              'يُستخدم اليوم في المساعدات الصوتية، السيارات ذاتية القيادة، التشخيص الطبي، وأنظمة التوصية.',
        ),
        Article(
          id: 'a2',
          categoryId: ContentCategory.programming.id,
          title: 'أساسيات لغة بايثون',
          summary: 'لماذا تُعدّ بايثون أفضل لغة للمبتدئين؟',
          tags: const ['Python', 'برمجة', 'مبتدئ'],
          readMinutes: 6,
          views: 980,
          likes: 175,
          content:
              'بايثون لغة برمجة عالية المستوى تتميّز ببساطة قواعدها وقربها من اللغة الإنجليزية الطبيعية.\n\n'
              'مثال على أول برنامج:\n'
              'print("مرحباً بالعالم")\n\n'
              'تدعم بايثون البرمجة الكائنية والوظيفية، ولها مكتبات قوية مثل NumPy للحسابات و Django لتطوير الويب '
              'و TensorFlow للذكاء الاصطناعي. لهذا تُعد البوابة المثالية لدخول عالم البرمجة.',
        ),
        Article(
          id: 'a3',
          categoryId: ContentCategory.general.id,
          title: 'كيف يعمل الإنترنت؟',
          summary: 'رحلة الحزمة من جهازك إلى الخادم والعودة.',
          tags: const ['شبكات', 'إنترنت', 'معرفة عامة'],
          readMinutes: 4,
          views: 640,
          likes: 90,
          content:
              'عندما تفتح موقعاً، يُترجم اسم النطاق إلى عنوان IP عبر نظام DNS، ثم تُرسَل طلبات عبر بروتوكول HTTP/HTTPS '
              'إلى الخادم الذي يستضيف الموقع.\n\n'
              'تنتقل البيانات على شكل حزم صغيرة عبر أجهزة التوجيه (Routers) حتى تصل وجهتها، ثم يُعاد تجميعها لعرض الصفحة. '
              'هذه العملية تحدث في أجزاء من الثانية.',
        ),
        Article(
          id: 'a4',
          categoryId: ContentCategory.ai.id,
          title: 'الفرق بين التعلّم العميق وتعلّم الآلة',
          summary: 'متى نستخدم كلاً منهما؟',
          tags: const ['Deep Learning', 'ML', 'AI'],
          readMinutes: 5,
          views: 720,
          likes: 130,
          content:
              'تعلّم الآلة يعتمد على خوارزميات تتعلم من البيانات المنظّمة وغالباً يحتاج هندسة سمات يدوية.\n\n'
              'أما التعلّم العميق فيستخدم شبكات عصبية متعددة الطبقات تستخرج السمات تلقائياً، ويتفوّق في الصور والصوت واللغة، '
              'لكنه يتطلب بيانات وموارد حسابية أكبر.',
        ),
        Article(
          id: 'a5',
          categoryId: ContentCategory.programming.id,
          title: 'مبادئ الكود النظيف',
          summary: 'اكتب كوداً يفهمه البشر قبل الآلة.',
          tags: const ['Clean Code', 'أفضل الممارسات'],
          readMinutes: 7,
          views: 510,
          likes: 88,
          content:
              'الكود النظيف يعني أسماء واضحة، دوال صغيرة تؤدي مهمة واحدة، وتقليل التكرار (DRY).\n\n'
              'اتبع مبادئ SOLID، اكتب اختبارات، وافصل المسؤوليات. الكود يُقرأ أضعاف ما يُكتب، فاجعله مفهوماً.',
        ),
      ];

  static List<Course> courses() => [
        Course(
          id: 'c1',
          categoryId: ContentCategory.programming.id,
          title: 'أساسيات البرمجة بلغة بايثون',
          description: 'دورة شاملة من الصفر إلى احتراف أساسيات بايثون مع تطبيقات عملية.',
          instructor: 'م. سارة العلي',
          level: CourseLevel.beginner,
          rating: 4.8,
          studentsCount: 3200,
          lessons: const [
            Lesson(id: 'c1l1', title: 'مقدمة وتنصيب بايثون', durationMinutes: 12, content: 'نتعرّف على بايثون ونثبّت بيئة التطوير.'),
            Lesson(id: 'c1l2', title: 'المتغيرات وأنواع البيانات', durationMinutes: 15, content: 'الأرقام، النصوص، القوائم والقواميس.'),
            Lesson(id: 'c1l3', title: 'الشروط والحلقات', durationMinutes: 18, content: 'if/else و for و while بأمثلة عملية.'),
            Lesson(id: 'c1l4', title: 'الدوال', durationMinutes: 14, content: 'تعريف الدوال وتمرير المعاملات.'),
            Lesson(id: 'c1l5', title: 'مشروع تطبيقي', durationMinutes: 20, content: 'بناء آلة حاسبة بسيطة.'),
          ],
        ),
        Course(
          id: 'c2',
          categoryId: ContentCategory.ai.id,
          title: 'مدخل إلى تعلّم الآلة',
          description: 'افهم المفاهيم الأساسية لتعلّم الآلة وطبّق أول نموذج لك.',
          instructor: 'د. خالد منصور',
          level: CourseLevel.intermediate,
          rating: 4.7,
          studentsCount: 2100,
          lessons: const [
            Lesson(id: 'c2l1', title: 'ما هو تعلّم الآلة؟', durationMinutes: 10, content: 'أنواع التعلّم: مُوجَّه وغير مُوجَّه.'),
            Lesson(id: 'c2l2', title: 'البيانات والتجهيز', durationMinutes: 16, content: 'تنظيف البيانات وتقسيمها.'),
            Lesson(id: 'c2l3', title: 'الانحدار الخطي', durationMinutes: 18, content: 'أول نموذج تنبؤي.'),
            Lesson(id: 'c2l4', title: 'تقييم النماذج', durationMinutes: 14, content: 'الدقة، الاستدعاء، ومصفوفة الالتباس.'),
          ],
        ),
        Course(
          id: 'c3',
          categoryId: ContentCategory.general.id,
          title: 'مهارات التفكير النقدي',
          description: 'طوّر قدرتك على التحليل واتخاذ القرار الصحيح.',
          instructor: 'أ. ليلى حسن',
          level: CourseLevel.beginner,
          rating: 4.6,
          studentsCount: 1500,
          lessons: const [
            Lesson(id: 'c3l1', title: 'مقدمة في التفكير النقدي', durationMinutes: 10, content: 'لماذا نحتاجه؟'),
            Lesson(id: 'c3l2', title: 'المغالطات المنطقية', durationMinutes: 15, content: 'تعرّف على الأخطاء الشائعة.'),
            Lesson(id: 'c3l3', title: 'اتخاذ القرار', durationMinutes: 12, content: 'أدوات عملية للقرار.'),
          ],
        ),
      ];

  static List<Quiz> quizzes() => [
        Quiz(
          id: 'q1',
          categoryId: ContentCategory.ai.id,
          title: 'اختبار: أساسيات الذكاء الاصطناعي',
          description: 'اختبر معرفتك بمفاهيم AI الأساسية.',
          questions: const [
            Question(
              id: 'q1a',
              text: 'ماذا يعني اختصار AI؟',
              options: ['الذكاء الاصطناعي', 'تحليل المعلومات', 'الواجهة التلقائية', 'التكامل الآلي'],
              correctIndex: 0,
              explanation: 'AI = Artificial Intelligence = الذكاء الاصطناعي.',
            ),
            Question(
              id: 'q1b',
              text: 'أيٌّ مما يلي فرع من الذكاء الاصطناعي؟',
              options: ['تصميم الجرافيك', 'تعلّم الآلة', 'إدارة المشاريع', 'المحاسبة'],
              correctIndex: 1,
              explanation: 'تعلّم الآلة فرع رئيسي من الذكاء الاصطناعي.',
            ),
            Question(
              id: 'q1c',
              text: 'التعلّم العميق يعتمد على:',
              options: ['قواعد ثابتة', 'الشبكات العصبية', 'جداول البيانات', 'الذاكرة فقط'],
              correctIndex: 1,
              explanation: 'الشبكات العصبية متعددة الطبقات أساس التعلّم العميق.',
            ),
          ],
        ),
        Quiz(
          id: 'q2',
          categoryId: ContentCategory.programming.id,
          title: 'اختبار: أساسيات بايثون',
          description: 'تحقّق من فهمك للأساسيات.',
          questions: const [
            Question(
              id: 'q2a',
              text: 'ما الأمر الذي يطبع نصاً في بايثون؟',
              options: ['echo', 'print', 'console.log', 'printf'],
              correctIndex: 1,
              explanation: 'الدالة print() تطبع المخرجات.',
            ),
            Question(
              id: 'q2b',
              text: 'أي نوع يُمثّل قائمة في بايثون؟',
              options: ['list', 'array', 'vector', 'table'],
              correctIndex: 0,
              explanation: 'list هو نوع القوائم في بايثون.',
            ),
          ],
        ),
      ];

  static List<Achievement> achievements() => const [
        Achievement(id: 'ach1', title: 'البداية', description: 'أول تسجيل دخول', icon: Icons.flag, color: Color(0xFF0EA5E9), requiredXp: 0),
        Achievement(id: 'ach2', title: 'متعلّم نشط', description: 'وصول 100 نقطة', icon: Icons.school, color: Color(0xFF22C55E), requiredXp: 100),
        Achievement(id: 'ach3', title: 'مثابر', description: 'وصول 300 نقطة', icon: Icons.local_fire_department, color: Color(0xFFF59E0B), requiredXp: 300),
        Achievement(id: 'ach4', title: 'خبير', description: 'وصول 500 نقطة', icon: Icons.workspace_premium, color: Color(0xFFA855F7), requiredXp: 500),
        Achievement(id: 'ach5', title: 'أسطورة', description: 'وصول 1000 نقطة', icon: Icons.emoji_events, color: Color(0xFFDC2626), requiredXp: 1000),
      ];

  static List<Post> posts() => [
        Post(
          id: 'p1',
          authorId: 'u_demo2',
          authorName: 'أحمد التقني',
          tag: 'برمجة',
          text: 'بدأت اليوم دورة بايثون وأنا متحمّس جداً! أي نصائح للمبتدئين؟ 🚀',
          createdAt: DateTime.now().subtract(const Duration(hours: 2)),
          likedBy: const ['u_demo3'],
          comments: [
            Comment(
              id: 'cm1',
              postId: 'p1',
              authorName: 'منى',
              text: 'تدرّب يومياً ولو نصف ساعة، الاستمرارية هي السر!',
              createdAt: DateTime.now().subtract(const Duration(hours: 1)),
            ),
          ],
        ),
        Post(
          id: 'p2',
          authorId: 'u_demo3',
          authorName: 'سلمى AI',
          tag: 'ذكاء اصطناعي',
          text: 'مقال "الفرق بين التعلّم العميق وتعلّم الآلة" رائع وبسّط لي الفكرة كثيراً 👏',
          createdAt: DateTime.now().subtract(const Duration(hours: 6)),
          likedBy: const ['u_demo2'],
        ),
      ];

  /// مستخدمون افتراضيون للوحة المتصدّرين والمحادثات.
  static List<Map<String, dynamic>> seedUsers() => [
        {
          'id': 'u_demo',
          'name': 'مستخدم تجريبي',
          'email': AppConstants.demoUserEmail,
          'password': AppConstants.demoUserPassword,
          'role': 'user',
          'xp': 180,
          'streak': 3,
          'interests': [ContentCategory.programming.id, ContentCategory.ai.id],
        },
        {
          'id': 'u_admin',
          'name': 'المدير',
          'email': AppConstants.demoAdminEmail,
          'password': AppConstants.demoAdminPassword,
          'role': 'admin',
          'xp': 1250,
          'streak': 12,
        },
        {'id': 'u_demo2', 'name': 'أحمد التقني', 'email': 'ahmed@maarifah.app', 'password': '123456', 'role': 'user', 'xp': 540, 'streak': 7},
        {'id': 'u_demo3', 'name': 'سلمى AI', 'email': 'salma@maarifah.app', 'password': '123456', 'role': 'user', 'xp': 720, 'streak': 9},
        {'id': 'u_demo4', 'name': 'منى المبرمجة', 'email': 'mona@maarifah.app', 'password': '123456', 'role': 'user', 'xp': 300, 'streak': 4},
      ];
}
