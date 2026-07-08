import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/core/services/storage_service.dart';
import 'package:maarifah_app/data/datasources/local_data_source.dart';
import 'package:maarifah_app/data/datasources/seed_data.dart';
import 'package:maarifah_app/core/constants/app_constants.dart';
import '../../helpers/mocks.dart';

/// Mock مبسّط لـ StorageService يستخدم Map في الذاكرة.
class MapStorageService implements StorageService {
  final _data = <String, dynamic>{};

  @override
  Future<void> setString(String key, String value) async => _data[key] = value;

  @override
  String? getString(String key) => _data[key] as String?;

  @override
  Future<void> setJsonList(String key, List<Map<String, dynamic>> value) async {
    _data[key] = value;
  }

  @override
  List<Map<String, dynamic>> getJsonList(String key) {
    final v = _data[key];
    if (v is List) return List<Map<String, dynamic>>.from(v);
    return [];
  }

  @override
  Map<String, dynamic>? getJson(String key) {
    final v = _data[key];
    if (v is Map) return Map<String, dynamic>.from(v);
    return null;
  }

  @override
  Future<void> setJson(String key, Map<String, dynamic> value) async {
    _data[key] = value;
  }

  @override
  Future<void> remove(String key) async {
    _data.remove(key);
  }

  @override
  bool getBool(String key, {bool fallback = false}) => _data[key] as bool? ?? fallback;

  @override
  Future<void> setBool(String key, bool value) async => _data[key] = value;
}

void main() {
  late MapStorageService storage;
  late LocalDataSource dataSource;

  setUp(() {
    storage = MapStorageService();
    dataSource = LocalDataSource(storage);
  });

  group('LocalDataSource', () {
    test('يبذر المستخدمين عند أول تشغيل', () {
      // SeedData.seedUsers() = 5 مستخدمين
      expect(dataSource.allUsers().length, SeedData.seedUsers().length);
    });

    test('findUserByEmail يبحث بشكل صحيح', () {
      final user = dataSource.findUserByEmail(AppConstants.demoUserEmail);
      expect(user, isNotNull);
      expect(user!['name'], 'مستخدم تجريبي');
    });

    test('findUserByEmail غير حساس لحالة الأحرف', () {
      final user = dataSource.findUserByEmail(AppConstants.demoUserEmail.toUpperCase());
      expect(user, isNotNull);
    });

    test('findUserByEmail يرجع null لغير الموجود', () {
      final user = dataSource.findUserByEmail('ghost@test.com');
      expect(user, isNull);
    });

    test('findUserById يعثر على المستخدم', () {
      final user = dataSource.findUserById('u_demo');
      expect(user, isNotNull);
      expect(user!['id'], 'u_demo');
    });

    test('currentUserId يقرأ ويكتب', () async {
      expect(dataSource.currentUserId, isNull);
      await dataSource.setCurrentUserId('u_demo');
      expect(dataSource.currentUserId, 'u_demo');
      await dataSource.setCurrentUserId(null);
      expect(dataSource.currentUserId, isNull);
    });

    test('favoritesOf يعود بمجموعة فارغة لمستخدم جديد', () {
      final favorites = dataSource.favoritesOf('u_demo');
      expect(favorites, isEmpty);
    });

    test('toggleFavorite يضيف ويزيل', () async {
      await dataSource.toggleFavorite('u1', 'a1');
      expect(dataSource.favoritesOf('u1'), contains('a1'));
      await dataSource.toggleFavorite('u1', 'a1');
      expect(dataSource.favoritesOf('u1'), isNot(contains('a1')));
    });

    test('insertUser يضيف مستخدم جديد', () async {
      await dataSource.insertUser({
        'id': 'u_new',
        'name': 'جديد',
        'email': 'new@test.com',
        'password': '123456',
      });
      expect(dataSource.findUserByEmail('new@test.com'), isNotNull);
    });

    test('allUsers يعيد جميع المستخدمين', () {
      final users = dataSource.allUsers();
      expect(users.length, SeedData.seedUsers().length);
    });
  });
}
