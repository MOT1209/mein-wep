import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/core/constants/app_constants.dart';
import 'package:maarifah_app/core/services/storage_service.dart';
import 'package:maarifah_app/data/datasources/local_data_source.dart';
import 'package:maarifah_app/data/models/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('LocalDataSource', () {
    late SharedPreferences prefs;
    late StorageService storage;
    late LocalDataSource dataSource;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      prefs = await SharedPreferences.getInstance();
      storage = StorageService(prefs);
      dataSource = LocalDataSource(storage);
    });

    test('يبذر المستخدمين عند أول تشغيل', () {
      final users = storage.getJsonList(AppConstants.kUsers);
      expect(users, isNotEmpty);
      expect(users.length, 2);
    });

    test('findUserByEmail يبحث بشكل صحيح', () {
      final user = dataSource.findUserByEmail('user@maarifah.app');
      expect(user, isNotNull);
      expect(user!['name'], 'مستخدم معرفة');
    });

    test('findUserByEmail غير حساس لحالة الأحرف', () {
      final user = dataSource.findUserByEmail('USER@MAARIFAH.APP');
      expect(user, isNotNull);
    });

    test('findUserByEmail يرجع null لغير الموجود', () {
      expect(dataSource.findUserByEmail('x@y.com'), isNull);
    });

    test('findUserById يعثر على المستخدم', () {
      final users = storage.getJsonList(AppConstants.kUsers);
      final id = users.first['id'] as String;
      expect(dataSource.findUserById(id), isNotNull);
    });

    test('currentUserId يقرأ ويكتب', () async {
      expect(dataSource.currentUserId, isNull);
      await dataSource.setCurrentUserId('u1');
      expect(dataSource.currentUserId, 'u1');
      await dataSource.setCurrentUserId(null);
      expect(dataSource.currentUserId, isNull);
    });

    test('favoritesOf يعود بمجموعة فارغة لمستخدم جديد', () {
      expect(dataSource.favoritesOf('new_user'), isEmpty);
    });

    test('toggleFavorite يضيف ويزيل', () async {
      await dataSource.toggleFavorite('u1', 'a1');
      expect(dataSource.favoritesOf('u1'), contains('a1'));
      await dataSource.toggleFavorite('u1', 'a1');
      expect(dataSource.favoritesOf('u1'), doesNotContain('a1'));
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

    test('updateUser يحدث بيانات المستخدم', () async {
      final rawUser = UserModel.fromJson(dataSource.findUserByEmail('user@maarifah.app')!);
      final updated = UserModel.fromEntity(rawUser.copyWith(name: 'اسم محدث'));
      await dataSource.updateUser(updated, password: '123456');
      final found = dataSource.findUserByEmail('user@maarifah.app')!;
      expect(found['name'], 'اسم محدث');
    });

    test('allUsers يعيد جميع المستخدمين', () {
      final users = dataSource.allUsers();
      expect(users.length, 2);
      expect(users.first, isA<UserModel>());
    });
  });
}
