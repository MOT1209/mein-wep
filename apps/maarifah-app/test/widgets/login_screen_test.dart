import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:maarifah_app/presentation/providers/auth_provider.dart';
import 'package:maarifah_app/presentation/providers/favorites_provider.dart';
import 'package:maarifah_app/presentation/screens/auth/login_screen.dart';
import '../helpers/mocks.dart';

Widget buildTestApp(MockAuthRepositoryImpl mockAuthRepo, MockFavoritesRepositoryImpl mockFavRepo) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => AuthProvider(mockAuthRepo)),
      ChangeNotifierProvider(create: (_) => FavoritesProvider(mockFavRepo)),
    ],
    child: const MaterialApp(
      home: LoginScreen(),
    ),
  );
}

void main() {
  late MockAuthRepositoryImpl mockAuthRepo;
  late MockFavoritesRepositoryImpl mockFavRepo;

  setUp(() {
    mockAuthRepo = MockAuthRepositoryImpl();
    mockFavRepo = MockFavoritesRepositoryImpl();
  });

  testWidgets('يعرض حقلي البريد وكلمة المرور', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestApp(mockAuthRepo, mockFavRepo));

    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.text('تسجيل الدخول'), findsOneWidget);
  });

  testWidgets('يظهر SnackBar عند خطأ في تسجيل الدخول', (WidgetTester tester) async {
    when(mockAuthRepo.login(any, any))
        .thenAnswer((_) => Future.error(const AuthException('كلمة المرور غير صحيحة')));

    await tester.pumpWidget(buildTestApp(mockAuthRepo, mockFavRepo));
    await tester.pump();

    final loginButton = find.text('تسجيل الدخول');
    await tester.tap(loginButton);
    await tester.pumpAndSettle();

    expect(find.text('كلمة المرور غير صحيحة'), findsOneWidget);
  });

  testWidgets('يوجد زر تسجيل الدخول', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestApp(mockAuthRepo, mockFavRepo));
    await tester.pump();

    expect(find.byType(ElevatedButton), findsOneWidget);
  });
}
