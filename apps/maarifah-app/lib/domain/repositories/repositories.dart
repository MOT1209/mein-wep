import '../entities/article.dart';
import '../entities/achievement.dart';
import '../entities/community.dart';
import '../entities/course.dart';
import '../entities/quiz.dart';
import '../entities/user.dart';

/// عقد مستودع المصادقة.
abstract class AuthRepository {
  Future<User?> currentUser();
  Future<User> login(String email, String password);
  Future<User> register(String name, String email, String password);
  Future<void> logout();
  Future<User> updateProfile(User user);
  Future<User> addXp(String userId, int amount);
}

/// عقد مستودع المحتوى المعرفي.
abstract class ContentRepository {
  Future<List<Article>> articles({String? categoryId});
  Future<Article?> articleById(String id);
  Future<List<Course>> courses({String? categoryId});
  Future<Course?> courseById(String id);
  Future<List<Quiz>> quizzes({String? categoryId});
  Future<Quiz?> quizById(String id);
  // عمليات لوحة التحكم
  Future<void> upsertArticle(Article article);
  Future<void> deleteArticle(String id);
  Future<void> upsertCourse(Course course);
  Future<void> deleteCourse(String id);
}

/// عقد مستودع المجتمع.
abstract class CommunityRepository {
  Future<List<Post>> posts();
  Future<Post> addPost(Post post);
  Future<Post> toggleLike(String postId, String userId);
  Future<Post> addComment(String postId, Comment comment);
  Future<List<Message>> messages(String peerId);
  Future<Message> sendMessage(String peerId, Message message);
}

/// عقد مستودع التحفيز (الإنجازات والمتصدرين).
abstract class GamificationRepository {
  Future<List<Achievement>> achievements();
  Future<List<User>> leaderboard();
}

/// عقد مستودع المفضلة.
abstract class FavoritesRepository {
  Future<Set<String>> favorites(String userId);
  Future<void> toggle(String userId, String articleId);
}
