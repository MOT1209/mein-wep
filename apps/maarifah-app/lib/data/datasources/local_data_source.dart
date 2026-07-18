import '../../core/constants/app_constants.dart';
import '../../core/services/storage_service.dart';
import '../models/user_model.dart';
import 'seed_data.dart';

/// مصدر البيانات المحلي.
/// - المستخدمون يُخزّنون في SharedPreferences (مع كلمة المرور).
/// - المحتوى والمجتمع يُحفظ في الذاكرة (قابل للتعديل من لوحة التحكم خلال الجلسة).
class LocalDataSource {
  LocalDataSource(this._storage) {
    _ensureSeeded();
  }

  final StorageService _storage;

  void _ensureSeeded() {
    final existing = _storage.getJsonList(AppConstants.kUsers);
    if (existing.isEmpty) {
      _storage.setJsonList(AppConstants.kUsers, SeedData.seedUsers());
    }
  }

  // ---------- المستخدمون ----------
  List<Map<String, dynamic>> _rawUsers() => _storage.getJsonList(AppConstants.kUsers);

  Future<void> _saveUsers(List<Map<String, dynamic>> users) =>
      _storage.setJsonList(AppConstants.kUsers, users);

  Map<String, dynamic>? findUserByEmail(String email) {
    final e = email.trim().toLowerCase();
    for (final u in _rawUsers()) {
      if ((u['email'] as String).toLowerCase() == e) return u;
    }
    return null;
  }

  Map<String, dynamic>? findUserById(String id) {
    for (final u in _rawUsers()) {
      if (u['id'] == id) return u;
    }
    return null;
  }

  Future<void> insertUser(Map<String, dynamic> user) async {
    final users = _rawUsers()..add(user);
    await _saveUsers(users);
  }

  Future<void> updateUser(UserModel model, {String? password}) async {
    final users = _rawUsers();
    final i = users.indexWhere((u) => u['id'] == model.id);
    final json = model.toJson(password: password ?? _passwordOf(model.id));
    if (i == -1) {
      users.add(json);
    } else {
      users[i] = json;
    }
    await _saveUsers(users);
  }

  String? _passwordOf(String id) {
    final u = findUserById(id);
    return u?['password'] as String?;
  }

  List<UserModel> allUsers() => _rawUsers().map(UserModel.fromJson).toList();

  // ---------- الجلسة ----------
  String? get currentUserId => _storage.getString(AppConstants.kCurrentUserId);
  Future<void> setCurrentUserId(String? id) async {
    if (id == null) {
      await _storage.remove(AppConstants.kCurrentUserId);
    } else {
      await _storage.setString(AppConstants.kCurrentUserId, id);
    }
  }

  // ---------- المفضلة ----------
  Set<String> favoritesOf(String userId) {
    final map = _storage.getJson(AppConstants.kFavorites) ?? {};
    final list = (map[userId] as List<dynamic>?)?.cast<String>() ?? const [];
    return list.toSet();
  }

  Future<void> toggleFavorite(String userId, String articleId) async {
    final map = _storage.getJson(AppConstants.kFavorites) ?? {};
    final list = ((map[userId] as List<dynamic>?)?.cast<String>() ?? <String>[]).toSet();
    if (!list.add(articleId)) list.remove(articleId);
    map[userId] = list.toList();
    await _storage.setJson(AppConstants.kFavorites, map);
  }
}
