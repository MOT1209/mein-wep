import 'dart:async';
import 'dart:math';

import '../../domain/entities/article.dart';
import '../../domain/entities/course.dart';

/// خدمة الذكاء الاصطناعي.
///
/// تعمل محلياً (Rule-based) كي يعمل التطبيق مباشرة بلا مفاتيح API،
/// مع نقطة توصيل واضحة لأي مزود حقيقي (OpenAI/Anthropic/Gemini) عبر [chatRemote].
class AiService {
  final _rng = Random();

  /// مساعد المحادثة — يردّ بإجابة مبنية على كلمات مفتاحية.
  Future<String> chat(String message) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    final m = message.trim().toLowerCase();

    if (m.isEmpty) {
      return 'اكتب سؤالك وسأساعدك 🙂';
    }
    if (_has(m, ['مرحبا', 'اهلا', 'السلام', 'hi', 'hello'])) {
      return 'أهلاً بك في مساعد معرفة! كيف أقدر أساعدك اليوم؟ يمكنك سؤالي عن البرمجة، الذكاء الاصطناعي، أو الدورات.';
    }
    if (_has(m, ['python', 'بايثون'])) {
      return 'بايثون لغة برمجة عالية المستوى سهلة القراءة، مثالية للمبتدئين وللذكاء الاصطناعي وتحليل البيانات. أنصحك بمسار "أساسيات البرمجة" في قسم الدورات.';
    }
    if (_has(m, ['ذكاء', 'ai', 'تعلم الالة', 'machine learning'])) {
      return 'الذكاء الاصطناعي هو محاكاة الذكاء البشري في الآلات. يشمل تعلّم الآلة والتعلّم العميق. تصفّح قسم "الذكاء الاصطناعي" لمقالات متدرّجة من الصفر.';
    }
    if (_has(m, ['دورة', 'دورات', 'course', 'تعلم'])) {
      return 'لدينا دورات في البرمجة والذكاء الاصطناعي والمعرفة العامة. افتح تبويب "الدورات" واختر مستواك، وستحصل على شهادة عند الإكمال.';
    }
    if (_has(m, ['نقاط', 'xp', 'انجاز', 'شارة'])) {
      return 'تكسب نقاط XP بإكمال الدروس واجتياز الاختبارات وتسجيل الدخول اليومي. كل 500 نقطة = مستوى جديد، وتفتح شارات وإنجازات!';
    }
    if (_has(m, ['اختبار', 'quiz', 'امتحان'])) {
      return 'الاختبارات تقيس فهمك وتمنحك 100 نقطة عند النجاح. جرّب تبويب "الاختبارات" واختر التصنيف المناسب.';
    }
    const fallback = [
      'سؤال ممتاز! بناءً على فهمي، أنصحك بالبدء من الأساسيات ثم التدرّج. هل تريد أن أرشّح لك دورة مناسبة؟',
      'يمكنني مساعدتك أكثر لو حدّدت المجال: برمجة، ذكاء اصطناعي، أم معرفة عامة؟',
      'فكرة رائعة للتعلّم! ابدأ بمقال تمهيدي ثم طبّق عملياً، والتطبيق هو مفتاح الإتقان.',
    ];
    return fallback[_rng.nextInt(fallback.length)];
  }

  /// نقطة التوصيل بمزود حقيقي. استبدل المحتوى باستدعاء HTTP فعلي.
  Future<String> chatRemote(String message, {required String apiKey}) async {
    // مثال (غير مفعّل افتراضياً):
    // final res = await http.post(Uri.parse('https://api.provider.com/v1/chat'),
    //   headers: {'Authorization': 'Bearer $apiKey', 'Content-Type': 'application/json'},
    //   body: jsonEncode({'message': message}));
    // return (jsonDecode(res.body)['reply'] as String);
    throw UnimplementedError('وصّل مزود AI حقيقي هنا باستخدام apiKey');
  }

  /// بحث ذكي يرتّب المقالات حسب التطابق.
  List<Article> smartSearch(String query, List<Article> articles) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return articles;
    final scored = articles.map((a) {
      var score = 0;
      if (a.title.toLowerCase().contains(q)) score += 3;
      if (a.summary.toLowerCase().contains(q)) score += 2;
      if (a.tags.any((t) => t.toLowerCase().contains(q))) score += 2;
      if (a.content.toLowerCase().contains(q)) score += 1;
      return MapEntry(a, score);
    }).where((e) => e.value > 0).toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return scored.map((e) => e.key).toList();
  }

  /// توصيات بناءً على تصنيفات اهتمام المستخدم.
  List<Course> recommend(List<Course> all, Set<String> interests, {int max = 5}) {
    if (interests.isEmpty) return all.take(max).toList();
    final ranked = [...all]..sort((a, b) {
        final sa = interests.contains(a.categoryId) ? 1 : 0;
        final sb = interests.contains(b.categoryId) ? 1 : 0;
        if (sa != sb) return sb - sa;
        return b.rating.compareTo(a.rating);
      });
    return ranked.take(max).toList();
  }

  /// الأسئلة الشائعة الذكية.
  List<({String q, String a})> smartFaq() => const [
        (q: 'كيف أبدأ التعلم؟', a: 'اختر مساراً من تبويب الدورات وابدأ بالدرس الأول.'),
        (q: 'كيف أكسب النقاط؟', a: 'أكمل الدروس، اجتز الاختبارات، وسجّل دخولك يومياً.'),
        (q: 'هل أحصل على شهادة؟', a: 'نعم، عند إكمال الدورة بنسبة 100%.'),
        (q: 'كيف أتواصل مع المجتمع؟', a: 'انشر سؤالك في تبويب المجتمع وتفاعل مع الآخرين.'),
      ];

  bool _has(String text, List<String> keys) => keys.any(text.contains);
}
