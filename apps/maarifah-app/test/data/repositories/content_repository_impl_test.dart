import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/data/datasources/seed_data.dart';
import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/domain/entities/article.dart';
import 'package:maarifah_app/domain/entities/course.dart';

void main() {
  late ContentRepositoryImpl repo;

  setUp(() {
    repo = ContentRepositoryImpl();
  });

  group('ContentRepositoryImpl — articles', () {
    test('يعيد جميع المقالات', () async {
      final articles = await repo.articles();
      expect(articles, isNotEmpty);
      expect(articles, isA<List<Article>>());
    });

    test('يفلتر حسب categoryId', () async {
      final aiArticles = await repo.articles(categoryId: 'ai');
      expect(aiArticles.every((a) => a.categoryId == 'ai'), isTrue);
    });

    test('articleById يعيد مقالة محددة', () async {
      final all = await repo.articles();
      final id = all.first.id;
      final found = await repo.articleById(id);
      expect(found, isNotNull);
      expect(found!.id, id);
    });

    test('articleById يعيد null لغير الموجود', () async {
      final found = await repo.articleById('not-exist');
      expect(found, isNull);
    });
  });

  group('ContentRepositoryImpl — courses', () {
    test('يعيد جميع الدورات', () async {
      final courses = await repo.courses();
      expect(courses, isNotEmpty);
    });

    test('يفلتر حسب categoryId', () async {
      final filtered = await repo.courses(categoryId: 'ai');
      expect(filtered.every((c) => c.categoryId == 'ai'), isTrue);
    });
  });

  group('ContentRepositoryImpl — quizzes', () {
    test('يعيد جميع الاختبارات', () async {
      final quizzes = await repo.quizzes();
      expect(quizzes, isNotEmpty);
    });

    test('quizById يعيد اختباراً محدداً', () async {
      final all = await repo.quizzes();
      final id = all.first.id;
      final found = await repo.quizById(id);
      expect(found, isNotNull);
    });
  });

  group('ContentRepositoryImpl — CRUD (مقالات)', () {
    test('upsertArticle يضيف مقالة جديدة', () async {
      final article = Article(
        id: 'new_article',
        title: 'مقال جديد',
        summary: 'ملخص',
        content: 'محتوى',
        categoryId: 'general',
      );
      await repo.upsertArticle(article);
      final all = await repo.articles();
      expect(all.any((a) => a.id == 'new_article'), isTrue);
    });

    test('deleteArticle يزيل مقالة', () async {
      final all = await repo.articles();
      final id = all.first.id;
      await repo.deleteArticle(id);
      final after = await repo.articles();
      expect(after.any((a) => a.id == id), isFalse);
    });

    test('upsertArticle يحدث مقالة موجودة', () async {
      final all = await repo.articles();
      final id = all.first.id;
      final updated = Article(
        id: id,
        title: 'عنوان محدث',
        summary: 'ملخص محدث',
        content: 'محتوى محدث',
        categoryId: all.first.categoryId,
      );
      await repo.upsertArticle(updated);
      final article = await repo.articleById(id);
      expect(article!.title, 'عنوان محدث');
    });
  });

  group('ContentRepositoryImpl — CRUD (دورات)', () {
    test('upsertCourse يضيف ويزيل', () async {
      const course = Course(
        id: 'new_course',
        title: 'دورة جديدة',
        description: 'وصف',
        categoryId: 'general',
        lessons: [],
      );
      await repo.upsertCourse(course);
      await repo.deleteCourse('new_course');
      final found = await repo.courseById('new_course');
      expect(found, isNull);
    });
  });
}
