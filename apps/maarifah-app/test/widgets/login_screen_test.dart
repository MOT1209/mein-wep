import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/presentation/providers/auth_provider.dart';
import 'package:maarifah_app/presentation/providers/favorites_provider.dart';
import 'package:maarifah_app/presentation/screens/auth/login_screen.dart';
import '../helpers/mocks.dart';

Widget buildTestApp(MockAuthRepository mockAuthRepo, MockFavoritesRepository mockFavRepo) {
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
  testWidgets('يعرض حقلي البريد وكلمة المرور', (WidgetTester tester) async {
    final mockAuthRepo = MockAuthRepository();
    final mockFavRepo = MockFavoritesRepository();

    await tester.pumpWidget(buildTestApp(mockAuthRepo, mockFavRepo));
    await tester.pump();

    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.text('تسجيل الدخول'), findsOneWidget);
  });

  testWidgets('يظهر SnackBar عند خطأ في تسجيل الدخول', (WidgetTester tester) async {
    final mockAuthRepo = MockAuthRepository();
    final mockFavRepo = MockFavoritesRepository();
    mockAuthRepo.throwsOnLogin(const AuthException('فشل تسجيل الدخول'));

    await tester.pumpWidget(buildTestApp(mockAuthRepo, mockFavRepo));
    await tester.pump();

    // LoginScreen uses AppConstants.demoUserEmail as default
    await tester.tap(find.text('تسجيل الدخول'));
    await tester.pumpAndSettle();

    expect(find.text('فشل تسجيل الدخول'), findsOneWidget);
  });

  testWidgets('يوجد زر تسجيل الدخول', (WidgetTester tester) async {
    final mockAuthRepo = MockAuthRepository();
    final mockFavRepo = MockFavoritesRepository();

    await tester.pumpWidget(buildTestApp(mockAuthRepo, mockFavRepo));
    await tester.pump();

    expect(find.byType(ElevatedButton), findsOneWidget);
  });
}
