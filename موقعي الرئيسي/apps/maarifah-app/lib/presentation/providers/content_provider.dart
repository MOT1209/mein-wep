import 'package:flutter/material.dart';

import '../../core/services/ai_service.dart';
import '../../domain/entities/article.dart';
import '../../domain/entities/course.dart';
import '../../domain/entities/quiz.dart';
import '../../domain/repositories/repositories.dart';

/// مزوّد المحتوى (مقالات، دورات، اختبارات) والبحث الذكي.
class ContentProvider extends ChangeNotifier {
  ContentProvider(this._repo, this._ai);
  final ContentRepository _repo;
  final AiService _ai;

  List<Article> articles = [];
  List<Course> courses = [];
  List<Quiz> quizzes = [];
  bool loading = false;

  Future<void> load() async {
    loading = true;
    notifyListeners();
    articles = await _repo.articles();
    courses = await _repo.courses();
    quizzes = await _repo.quizzes();
    loading = false;
    notifyListeners();
  }

  List<Article> articlesByCategory(String categoryId) =>
      articles.where((a) => a.categoryId == categoryId).toList();

  List<Course> coursesByCategory(String categoryId) =>
      courses.where((c) => c.categoryId == categoryId).toList();

  List<Quiz> quizzesByCategory(String categoryId) =>
      quizzes.where((q) => q.categoryId == categoryId).toList();

  List<Article> search(String query) => _ai.smartSearch(query, articles);

  List<Course> recommended(Set<String> interests) => _ai.recommend(courses, interests);

  // ---- عمليات لوحة التحكم ----
  Future<void> saveArticle(Article a) async {
    await _repo.upsertArticle(a);
    articles = await _repo.articles();
    notifyListeners();
  }

  Future<void> removeArticle(String id) async {
    await _repo.deleteArticle(id);
    articles = await _repo.articles();
    notifyListeners();
  }

  Future<void> saveCourse(Course c) async {
    await _repo.upsertCourse(c);
    courses = await _repo.courses();
    notifyListeners();
  }

  Future<void> removeCourse(String id) async {
    await _repo.deleteCourse(id);
    courses = await _repo.courses();
    notifyListeners();
  }
}
