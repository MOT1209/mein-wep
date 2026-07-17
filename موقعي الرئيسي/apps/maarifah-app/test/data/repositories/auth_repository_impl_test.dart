import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/data/datasources/local_data_source.dart';
import 'package:maarifah_app/core/services/storage_service.dart';
import 'package:maarifah_app/data/models/user_model.dart';

/// StorageService بسيط مخزّن في الذاكرة للاختبار.
class TestStorage implements StorageService {
  final _data = <String, dynamic>{};

  @override
  Future<void> setString(String key, String value) async => _data[key] = value;
  @override
  String? getString(String key) => _data[key] as String?;
  @override
  Future<void> setJsonList(String key, List<Map<String, dynamic>> value) async => _data[key] = value;
  @override
  List<Map<String, dynamic>> getJsonList(String key) {
    final v = _data[key];
    if (v is List) return List<Map<String, dynamic>>.from(v);
    return [];
  }
  @override
  Future<void> setJson(String key, Map<String, dynamic> value) async => _data[key] = value;
  @override
  Map<String, dynamic>? getJson(String key) {
    final v = _data[key];
    if (v is Map) return Map<String, dynamic>.from(v);
    return null;
  }
  @override
  Future<void> remove(String key) async => _data.remove(key);

  @override
  bool getBool(String key, {bool fallback = false}) => _data[key] as bool? ?? fallback;

  @override
  Future<void> setBool(String key, bool value) async => _data[key] = value;
}

void main() {
  group('AuthRepositoryImpl — login', () {
    test('يسجل الدخول بنجاح', () async {
      final storage = TestStorage();
      final local = LocalDataSource(storage);
      final repo = AuthRepositoryImpl(local);

      final user = await repo.login('user@maarifah.app', '123456');
      expect(user, isNotNull);
      expect(user.email, 'user@maarifah.app');
    });

    test('يرمي AuthException عند كلمة مرور خاطئة', () async {
      final storage = TestStorage();
      final local = LocalDataSource(storage);
      final repo = AuthRepositoryImpl(local);

      expect(
        () => repo.login('user@maarifah.app', 'wrong'),
        throwsA(isA<AuthException>()),
      );
    });
  });

  group('AuthRepositoryImpl — register', () {
    test('يسجل مستخدم جديد', () async {
      final storage = TestStorage();
      final local = LocalDataSource(storage);
      final repo = AuthRepositoryImpl(local);

      await repo.register('جديد', 'new@test.com', '123456');
      final user = await repo.login('new@test.com', '123456');
      expect(user.name, 'جديد');
    });
  });
}
