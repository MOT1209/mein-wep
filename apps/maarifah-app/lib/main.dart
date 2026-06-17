import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'core/services/ai_service.dart';
import 'core/services/notification_service.dart';
import 'core/services/storage_service.dart';
import 'data/datasources/local_data_source.dart';
import 'data/repositories/repositories_impl.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/community_provider.dart';
import 'presentation/providers/content_provider.dart';
import 'presentation/providers/favorites_provider.dart';
import 'presentation/providers/gamification_provider.dart';
import 'presentation/providers/settings_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // تهيئة الخدمات والطبقات (Dependency Injection يدوي).
  final storage = await StorageService.init();
  final local = LocalDataSource(storage);
  final aiService = AiService();
  final notificationService = NotificationService()..seedDemo();

  final authRepo = AuthRepositoryImpl(local);
  final contentRepo = ContentRepositoryImpl();
  final communityRepo = CommunityRepositoryImpl();
  final gamificationRepo = GamificationRepositoryImpl(local);
  final favoritesRepo = FavoritesRepositoryImpl(local);

  runApp(
    MultiProvider(
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
    ),
  );
}
