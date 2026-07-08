import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:maarifah_app/data/datasources/local_data_source.dart';
import 'package:maarifah_app/data/models/user_model.dart';
import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/domain/entities/user.dart';
import '../../helpers/mocks.dart';

void main() {
  late MockLocalDataSource mockLocal;
  late AuthRepositoryImpl repo;

  setUp(() {
    mockLocal = MockLocalDataSource();
    repo = AuthRepositoryImpl(mockLocal);
  });

  group('AuthRepositoryImpl — login', () {
    test('يسجل الدخول بنجاح', () async {
      when(mockLocal.findUserByEmail('test@example.com')).thenReturn({
        'id': 'u1',
        'name': 'مستخدم',
        'email': 'test@example.com',
        'password': '123456',
      });

      final user = await repo.login('test@example.com', '123456');
      expect(user.id, 'u1');
      expect(user.name, 'مستخدم');
      verify(mockLocal.setCurrentUserId('u1')).called(1);
    });

    test('يرمي AuthException عند بريد غير موجود', () {
      when(mockLocal.findUserByEmail('x@y.com')).thenReturn(null);
      expect(
        () => repo.login('x@y.com', '123'),
        throwsA(isA<AuthException>()),
      );
    });

    test('يرمي AuthException عند كلمة مرور خاطئة', () {
      when(mockLocal.findUserByEmail('test@example.com')).thenReturn({
        'id': 'u1',
        'email': 'test@example.com',
        'password': 'correct',
      });
      expect(
        () => repo.login('test@example.com', 'wrong'),
        throwsA(isA<AuthException>()),
      );
    });
  });

  group('AuthRepositoryImpl — register', () {
    test('يسجل مستخدم جديد', () async {
      when(mockLocal.findUserByEmail('new@test.com')).thenReturn(null);

      final user = await repo.register('جديد', 'new@test.com', '123456');
      expect(user.name, 'جديد');
      expect(user.email, 'new@test.com');
      verify(mockLocal.insertUser(any)).called(1);
      verify(mockLocal.setCurrentUserId(user.id)).called(1);
    });

    test('يرمي AuthException عند بريد موجود', () {
      when(mockLocal.findUserByEmail('exists@test.com')).thenReturn({'id': 'u1'});
      expect(
        () => repo.register('مستخدم', 'exists@test.com', '123'),
        throwsA(isA<AuthException>()),
      );
    });
  });

  group('AuthRepositoryImpl — currentUser', () {
    test('يعيد null إن لم يكن هناك مستخدم حالي', () async {
      when(mockLocal.currentUserId).thenReturn(null);
      final user = await repo.currentUser();
      expect(user, isNull);
    });

    test('يعيد المستخدم إن كان موجوداً', () async {
      when(mockLocal.currentUserId).thenReturn('u1');
      when(mockLocal.findUserById('u1')).thenReturn({
        'id': 'u1',
        'name': 'مستخدم',
        'email': 'u@test.com',
      });
      final user = await repo.currentUser();
      expect(user, isNotNull);
      expect(user!.id, 'u1');
    });
  });

  group('AuthRepositoryImpl — logout', () {
    test('يمسح المستخدم الحالي', () async {
      await repo.logout();
      verify(mockLocal.setCurrentUserId(null)).called(1);
    });
  });

  group('AuthRepositoryImpl — updateProfile', () {
    test('يحدث الملف الشخصي', () async {
      const updated = User(id: 'u1', name: 'اسم جديد', email: 'u@test.com');
      await repo.updateProfile(updated);
      verify(mockLocal.updateUser(any)).called(1);
    });
  });

  group('AuthRepositoryImpl — addXp', () {
    test('يضيف نقاط XP', () async {
      when(mockLocal.findUserById('u1')).thenReturn({
        'id': 'u1', 'name': 'مستخدم', 'email': 'u@test.com', 'xp': 0,
      });
      final user = await repo.addXp('u1', 100);
      expect(user.xp, 100);
      verify(mockLocal.updateUser(any)).called(1);
    });

    test('يرمي AuthException عند مستخدم غير موجود', () {
      when(mockLocal.findUserById('ghost')).thenReturn(null);
      expect(() => repo.addXp('ghost', 50), throwsA(isA<AuthException>()));
    });
  });
}
