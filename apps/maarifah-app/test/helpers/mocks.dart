/// ملف mocks يدوي بالكامل — بدون mockito.
///
/// لتجنب تعقيدات Dart 3.12 مع mockito's any<T>.

import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/domain/repositories/repositories.dart';
import 'package:maarifah_app/domain/entities/user.dart';

// ---- AuthRepository ----
class MockAuthRepository implements AuthRepository {
  User? _user;
  AuthException? _error;

  void returnsOnLogin(User user) => _user = user;
  void throwsOnLogin(AuthException e) => _error = e;
  void returnsOnRegister(User user) => _user = user;
  void throwsOnRegister(AuthException e) => _error = e;
  void returnsOnCurrentUser(User? user) => _user = user;
  void returnsOnAddXp(User user) => _user = user;
  void returnsOnLogout() { _user = null; _error = null; }

  @override
  Future<User> login(String email, String password) async {
    if (_error != null) throw _error!;
    return _user ?? User(id: 'mock', name: 'مستخدم', email: email);
  }

  @override
  Future<User> register(String name, String email, String password) async {
    if (_error != null) throw _error!;
    return _user ?? User(id: 'mock', name: name, email: email);
  }

  @override
  Future<User?> currentUser() async => _user;

  @override
  Future<void> logout() async { _user = null; }

  @override
  Future<User> updateProfile(User user) async => user;

  @override
  Future<User> addXp(String userId, int xp) async =>
      _user ?? User(id: userId, name: 'م', email: 'm@t.com', xp: xp);
}

// ---- FavoritesRepository ----
class MockFavoritesRepository implements FavoritesRepository {
  final Set<String> _favorites = {};

  @override
  Future<Set<String>> favorites(String userId) async => _favorites;

  @override
  Future<void> toggle(String userId, String articleId) async {
    if (_favorites.contains(articleId)) {
      _favorites.remove(articleId);
    } else {
      _favorites.add(articleId);
    }
  }
}
