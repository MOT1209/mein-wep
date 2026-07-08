import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:maarifah_app/domain/entities/user.dart';
import 'package:maarifah_app/presentation/providers/auth_provider.dart';
import '../../helpers/mocks.dart';

void main() {
  late MockAuthRepositoryImpl mockRepo;
  late AuthProvider provider;

  setUp(() {
    mockRepo = MockAuthRepositoryImpl();
    provider = AuthProvider(mockRepo);
  });

  group('AuthProvider — bootstrap', () {
    test('يضبط authenticated إن وجد مستخدم حالي', () async {
      when(mockRepo.currentUser()).thenAnswer(
        (_) async => const User(id: 'u1', name: 'مستخدم', email: 'u@test.com'),
      );
      await provider.bootstrap();
      expect(provider.status, AuthStatus.authenticated);
      expect(provider.user, isNotNull);
    });

    test('يضبط unauthenticated إن لم يوجد مستخدم', () async {
      when(mockRepo.currentUser()).thenAnswer((_) async => null);
      await provider.bootstrap();
      expect(provider.status, AuthStatus.unauthenticated);
    });
  });

  group('AuthProvider — login', () {
    test('يعود true عند نجاح تسجيل الدخول', () async {
      when(mockRepo.login('a@b.com', '123')).thenAnswer(
        (_) async => const User(id: 'u1', name: 'مستخدم', email: 'a@b.com'),
      );
      final result = await provider.login('a@b.com', '123');
      expect(result, isTrue);
      expect(provider.isAuthenticated, isTrue);
      expect(provider.loading, isFalse);
    });

    test('يعود false ويخزّن error عند الفشل', () async {
      when(mockRepo.login('x@y.com', 'wrong'))
          .thenAnswer((_) => Future.error(const AuthException('خطأ')));
      final result = await provider.login('x@y.com', 'wrong');
      expect(result, isFalse);
      expect(provider.error, isNotNull);
      expect(provider.loading, isFalse);
    });
  });

  group('AuthProvider — register', () {
    test('يسجل ويعيد true', () async {
      when(mockRepo.register('اسم', 'e@e.com', '123456')).thenAnswer(
        (_) async => const User(id: 'u2', name: 'اسم', email: 'e@e.com'),
      );
      final result = await provider.register('اسم', 'e@e.com', '123456');
      expect(result, isTrue);
      expect(provider.isAuthenticated, isTrue);
    });
  });

  group('AuthProvider — logout', () {
    test('يقطع الجلسة وينظف user', () async {
      await provider.logout();
      expect(provider.user, isNull);
      expect(provider.status, AuthStatus.unauthenticated);
      verify(mockRepo.logout()).called(1);
    });
  });

  group('AuthProvider — awardXp', () {
    test('يضيف XP ويعيد عدد المستويات', () async {
      provider.user = const User(id: 'u1', name: 'م', email: 'm@t.com');
      when(mockRepo.addXp('u1', 100)).thenAnswer(
        (_) async => const User(id: 'u1', name: 'م', email: 'm@t.com', xp: 100),
      );
      final levels = await provider.awardXp(100);
      expect(provider.user!.xp, 100);
      expect(levels, 0);
    });
  });
}
