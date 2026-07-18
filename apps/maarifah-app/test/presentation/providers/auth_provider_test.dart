import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/domain/entities/user.dart';
import 'package:maarifah_app/presentation/providers/auth_provider.dart';
import '../../helpers/mocks.dart';

void main() {
  group('AuthProvider — bootstrap', () {
    test('يضبط authenticated إن وجد مستخدم حالي', () async {
      final mockRepo = MockAuthRepository();
      mockRepo.returnsOnCurrentUser(const User(id: 'u1', name: 'مستخدم', email: 'u@test.com'));
      final provider = AuthProvider(mockRepo);

      await provider.bootstrap();
      expect(provider.status, AuthStatus.authenticated);
      expect(provider.user, isNotNull);
    });

    test('يضبط unauthenticated إن لم يوجد مستخدم', () async {
      final mockRepo = MockAuthRepository();
      mockRepo.returnsOnCurrentUser(null);
      final provider = AuthProvider(mockRepo);

      await provider.bootstrap();
      expect(provider.status, AuthStatus.unauthenticated);
    });
  });

  group('AuthProvider — login', () {
    test('يعود true عند نجاح تسجيل الدخول', () async {
      final mockRepo = MockAuthRepository();
      mockRepo.returnsOnLogin(const User(id: 'u1', name: 'مستخدم', email: 'a@b.com'));
      final provider = AuthProvider(mockRepo);

      final result = await provider.login('a@b.com', '123');
      expect(result, isTrue);
      expect(provider.isAuthenticated, isTrue);
      expect(provider.loading, isFalse);
    });

    test('يعود false ويخزّن error عند الفشل', () async {
      final mockRepo = MockAuthRepository();
      mockRepo.throwsOnLogin(const AuthException('خطأ'));
      final provider = AuthProvider(mockRepo);

      final result = await provider.login('x@y.com', 'wrong');
      expect(result, isFalse);
      expect(provider.error, isNotNull);
      expect(provider.loading, isFalse);
    });
  });

  group('AuthProvider — register', () {
    test('يسجل ويعيد true', () async {
      final mockRepo = MockAuthRepository();
      mockRepo.returnsOnRegister(const User(id: 'u2', name: 'اسم', email: 'e@e.com'));
      final provider = AuthProvider(mockRepo);

      final result = await provider.register('اسم', 'e@e.com', '123456');
      expect(result, isTrue);
      expect(provider.isAuthenticated, isTrue);
    });
  });

  group('AuthProvider — logout', () {
    test('يقطع الجلسة وينظف user', () async {
      final mockRepo = MockAuthRepository();
      mockRepo.returnsOnLogout();
      final provider = AuthProvider(mockRepo);

      await provider.logout();
      expect(provider.user, isNull);
      expect(provider.status, AuthStatus.unauthenticated);
    });
  });
}
