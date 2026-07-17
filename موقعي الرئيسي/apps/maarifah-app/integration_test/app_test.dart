/// اختبار تكاملي — يتطلب تشغيل التطبيق على جهاز/محاكي.
///
/// يشغّل:
///   flutter test integration_test/app_test.dart
///
/// أو على Android:
///   flutter drive --driver=test_driver/integration_test.dart --target=integration_test/app_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:provider/provider.dart';

import 'package:maarifah_app/app.dart';
import 'package:maarifah_app/core/services/storage_service.dart';
import 'package:maarifah_app/data/datasources/local_data_source.dart';
import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/presentation/providers/auth_provider.dart';
import 'package:maarifah_app/presentation/providers/community_provider.dart';
import 'package:maarifah_app/presentation/providers/content_provider.dart';
import 'package:maarifah_app/presentation/providers/favorites_provider.dart';
import 'package:maarifah_app/presentation/providers/gamification_provider.dart';
import 'package:maarifah_app/presentation/providers/settings_provider.dart';
import 'package:maarifah_app/core/services/ai_service.dart';
import 'package:maarifah_app/core/services/notification_service.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storage;
  late LocalDataSource local;

  setUp(() async {
    storage = StorageService(await SharedPreferencesMock.getInstance());
    local = LocalDataSource(storage);
  });

  Widget buildApp() {
    final aiService = AiService();
    final notificationService = NotificationService()..seedDemo();

    final authRepo = AuthRepositoryImpl(local);
    final contentRepo = ContentRepositoryImpl();
    final communityRepo = CommunityRepositoryImpl();
    final gamificationRepo = GamificationRepositoryImpl(local);
    final favoritesRepo = FavoritesRepositoryImpl(local);

    return MultiProvider(
      providers: [
        Provider<StorageService>.value(value: storage),
        Provider<AiService>.value(value: aiService),
        ChangeNotifierProvider<NotificationService>.value(value: notificationService),
        ChangeNotifierProvider(create: (_) => SettingsProvider(storage)),
        ChangeNotifierProvider(create: (_) => AuthProvider(authRepo)),
        ChangeNotifierProvider(create: (_) => ContentProvider(contentRepo, aiService)),
        ChangeNotifierProvider(create: (_) => CommunityProvider(communityRepo)),
        ChangeNotifierProvider(create: (_) => GamificationProvider(gamificationRepo)),
        ChangeNotifierProvider(create: (_) => FavoritesProvider(favoritesRepo)),
      ],
      child: MaarifahApp(storage: storage),
    );
  }

  testWidgets('التطبيق يعمل ويظهر شاشة البداية', (tester) async {
    await tester.pumpWidget(buildApp());
    await tester.pump(const Duration(seconds: 1));

    // يظهر شعار التطبيق أو نص "معرفة" في شاشة البداية
    expect(find.byType(MaterialApp), findsOneWidget);
  });

  testWidgets('يظهر شاشة تسجيل الدخول بعد splash', (tester) async {
    await tester.pumpWidget(buildApp());
    await tester.pumpAndSettle(const Duration(seconds: 3));

    // بعد splash → يظهر LoginScreen
    expect(find.text('مرحباً بعودتك 👋'), findsOneWidget);
  });

  testWidgets('تسجيل الدخول ثم عرض الصفحة الرئيسية', (tester) async {
    await tester.pumpWidget(buildApp());
    await tester.pumpAndSettle(const Duration(seconds: 3));

    // الضغط على زر تسجيل الدخول (بينات تجريبية موجودة مسبقاً)
    final loginBtn = find.text('تسجيل الدخول');
    expect(loginBtn, findsOneWidget);

    await tester.tap(loginBtn);
    await tester.pumpAndSettle(const Duration(seconds: 2));

    // بعد تسجيل الدخول → يظهر HomeScreen (ابحث عن شريط سفلي)
    expect(find.byType(NavigationBar), findsOneWidget);
  });
}

/// Mock SharedPreferences للاختبار التكاملي.
class SharedPreferencesMock {
  static Future<SharedPreferences> getInstance() async {
    SharedPreferences.setMockInitialValues({});
    return SharedPreferences.getInstance();
  }
}
