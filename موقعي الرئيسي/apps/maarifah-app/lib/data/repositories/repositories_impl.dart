import 'package:uuid/uuid.dart';

import '../../domain/entities/achievement.dart';
import '../../domain/entities/article.dart';
import '../../domain/entities/community.dart';
import '../../domain/entities/course.dart';
import '../../domain/entities/quiz.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/repositories.dart';
import '../datasources/local_data_source.dart';
import '../datasources/seed_data.dart';
import '../models/user_model.dart';

const _uuid = Uuid();

/// تنفيذ مستودع المصادقة باستخدام المصدر المحلي.
class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._local);
  final LocalDataSource _local;

  @override
  Future<User?> currentUser() async {
    final id = _local.currentUserId;
    if (id == null) return null;
    final raw = _local.findUserById(id);
    return raw == null ? null : UserModel.fromJson(raw);
  }

  @override
  Future<User> login(String email, String password) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    final raw = _local.findUserByEmail(email);
    if (raw == null) throw const AuthException('لا يوجد حساب بهذا البريد');
    if (raw['password'] != password) throw const AuthException('كلمة المرور غير صحيحة');
    final user = UserModel.fromJson(raw);
    await _local.setCurrentUserId(user.id);
    return user;
  }

  @override
  Future<User> register(String name, String email, String password) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    if (_local.findUserByEmail(email) != null) {
      throw const AuthException('البريد مستخدم بالفعل');
    }
    final user = UserModel(id: 'u_${_uuid.v4()}', name: name, email: email.trim());
    await _local.insertUser(user.toJson(password: password));
    await _local.setCurrentUserId(user.id);
    return user;
  }

  @override
  Future<void> logout() => _local.setCurrentUserId(null);

  @override
  Future<User> updateProfile(User user) async {
    final model = UserModel.fromEntity(user);
    await _local.updateUser(model);
    return model;
  }

  @override
  Future<User> addXp(String userId, int amount) async {
    final raw = _local.findUserById(userId);
    if (raw == null) throw const AuthException('مستخدم غير موجود');
    final user = UserModel.fromJson(raw);
    final updated = UserModel.fromEntity(user.copyWith(xp: user.xp + amount));
    await _local.updateUser(updated);
    return updated;
  }
}

class AuthException implements Exception {
  const AuthException(this.message);
  final String message;
  @override
  String toString() => message;
}

/// تنفيذ مستودع المحتوى (في الذاكرة، مبدوء من Seed).
class ContentRepositoryImpl implements ContentRepository {
  final List<Article> _articles = SeedData.articles();
  final List<Course> _courses = SeedData.courses();
  final List<Quiz> _quizzes = SeedData.quizzes();

  @override
  Future<List<Article>> articles({String? categoryId}) async {
    return categoryId == null
        ? List.unmodifiable(_articles)
        : _articles.where((a) => a.categoryId == categoryId).toList();
  }

  @override
  Future<Article?> articleById(String id) async =>
      _articles.where((a) => a.id == id).cast<Article?>().firstOrNull;

  @override
  Future<List<Course>> courses({String? categoryId}) async {
    return categoryId == null
        ? List.unmodifiable(_courses)
        : _courses.where((c) => c.categoryId == categoryId).toList();
  }

  @override
  Future<Course?> courseById(String id) async =>
      _courses.where((c) => c.id == id).cast<Course?>().firstOrNull;

  @override
  Future<List<Quiz>> quizzes({String? categoryId}) async {
    return categoryId == null
        ? List.unmodifiable(_quizzes)
        : _quizzes.where((q) => q.categoryId == categoryId).toList();
  }

  @override
  Future<Quiz?> quizById(String id) async =>
      _quizzes.where((q) => q.id == id).cast<Quiz?>().firstOrNull;

  @override
  Future<void> upsertArticle(Article article) async {
    final i = _articles.indexWhere((a) => a.id == article.id);
    if (i == -1) {
      _articles.insert(0, article);
    } else {
      _articles[i] = article;
    }
  }

  @override
  Future<void> deleteArticle(String id) async => _articles.removeWhere((a) => a.id == id);

  @override
  Future<void> upsertCourse(Course course) async {
    final i = _courses.indexWhere((c) => c.id == course.id);
    if (i == -1) {
      _courses.insert(0, course);
    } else {
      _courses[i] = course;
    }
  }

  @override
  Future<void> deleteCourse(String id) async => _courses.removeWhere((c) => c.id == id);
}

/// تنفيذ مستودع المجتمع (في الذاكرة).
class CommunityRepositoryImpl implements CommunityRepository {
  final List<Post> _posts = SeedData.posts();
  final Map<String, List<Message>> _chats = {};

  @override
  Future<List<Post>> posts() async =>
      List.unmodifiable(_posts..sort((a, b) => b.createdAt.compareTo(a.createdAt)));

  @override
  Future<Post> addPost(Post post) async {
    _posts.insert(0, post);
    return post;
  }

  @override
  Future<Post> toggleLike(String postId, String userId) async {
    final i = _posts.indexWhere((p) => p.id == postId);
    final p = _posts[i];
    final liked = p.likedBy.toList();
    if (!liked.remove(userId)) liked.add(userId);
    _posts[i] = p.copyWith(likedBy: liked);
    return _posts[i];
  }

  @override
  Future<Post> addComment(String postId, Comment comment) async {
    final i = _posts.indexWhere((p) => p.id == postId);
    final p = _posts[i];
    _posts[i] = p.copyWith(comments: [...p.comments, comment]);
    return _posts[i];
  }

  @override
  Future<List<Message>> messages(String peerId) async {
    final list = _chats.putIfAbsent(peerId, () => _seedChat());
    return List.unmodifiable(list);
  }

  @override
  Future<Message> sendMessage(String peerId, Message message) async {
    final list = _chats.putIfAbsent(peerId, () => _seedChat());
    list.add(message);
    // ردّ تلقائي بسيط
    list.add(Message(
      id: _uuid.v4(),
      senderId: peerId,
      text: 'شكراً لرسالتك! 👍',
      createdAt: DateTime.now().add(const Duration(seconds: 1)),
    ));
    return message;
  }

  List<Message> _seedChat() => [
        Message(
          id: _uuid.v4(),
          senderId: 'peer',
          text: 'مرحباً! كيف يمكنني مساعدتك؟',
          createdAt: DateTime.now().subtract(const Duration(minutes: 5)),
        ),
      ];
}

/// تنفيذ مستودع التحفيز.
class GamificationRepositoryImpl implements GamificationRepository {
  GamificationRepositoryImpl(this._local);
  final LocalDataSource _local;

  @override
  Future<List<Achievement>> achievements() async => SeedData.achievements();

  @override
  Future<List<User>> leaderboard() async {
    final users = _local.allUsers()..sort((a, b) => b.xp.compareTo(a.xp));
    return users;
  }
}

/// تنفيذ مستودع المفضلة.
class FavoritesRepositoryImpl implements FavoritesRepository {
  FavoritesRepositoryImpl(this._local);
  final LocalDataSource _local;

  @override
  Future<Set<String>> favorites(String userId) async => _local.favoritesOf(userId);

  @override
  Future<void> toggle(String userId, String articleId) =>
      _local.toggleFavorite(userId, articleId);
}
