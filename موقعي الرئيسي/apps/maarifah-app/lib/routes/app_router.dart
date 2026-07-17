import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/constants/app_constants.dart';
import '../core/services/storage_service.dart';
import '../presentation/providers/auth_provider.dart';
import '../presentation/screens/admin/admin_screen.dart';
import '../presentation/screens/ai/ai_assistant_screen.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/auth/register_screen.dart';
import '../presentation/screens/community/chat_screen.dart';
import '../presentation/screens/content/article_detail_screen.dart';
import '../presentation/screens/content/category_screen.dart';
import '../presentation/screens/courses/course_details_screen.dart';
import '../presentation/screens/favorites/favorites_screen.dart';
import '../presentation/screens/home/main_shell.dart';
import '../presentation/screens/notifications/notifications_screen.dart';
import '../presentation/screens/onboarding/onboarding_screen.dart';
import '../presentation/screens/profile/achievements_screen.dart';
import '../presentation/screens/profile/leaderboard_screen.dart';
import '../presentation/screens/profile/statistics_screen.dart';
import '../presentation/screens/quizzes/quiz_result_screen.dart';
import '../presentation/screens/quizzes/quiz_screen.dart';
import '../presentation/screens/search/search_screen.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../presentation/screens/splash/splash_screen.dart';

/// مسارات التطبيق باستخدام go_router مع حماية المصادقة.
class AppRouter {
  AppRouter(this.auth, this.storage);
  final AuthProvider auth;
  final StorageService storage;

  late final GoRouter router = GoRouter(
    initialLocation: '/splash',
    refreshListenable: auth,
    redirect: (context, state) {
      final loggingFlow = ['/splash', '/onboarding', '/login', '/register'];
      final atFlow = loggingFlow.contains(state.matchedLocation);

      if (auth.status == AuthStatus.unknown) return null;
      final onboardingSeen = storage.getBool(AppConstants.kOnboardingSeen);

      if (auth.status == AuthStatus.unauthenticated) {
        if (!onboardingSeen &&
            state.matchedLocation != '/onboarding' &&
            state.matchedLocation != '/login' &&
            state.matchedLocation != '/register') {
          return '/onboarding';
        }
        if (!atFlow) return '/login';
        return null;
      }

      // مُصادق عليه
      if (atFlow && state.matchedLocation != '/splash') return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/home', builder: (_, __) => const MainShell()),
      GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
      GoRoute(
        path: '/category/:id',
        builder: (_, s) => CategoryScreen(categoryId: s.pathParameters['id']!),
      ),
      GoRoute(
        path: '/article/:id',
        builder: (_, s) => ArticleDetailScreen(articleId: s.pathParameters['id']!),
      ),
      GoRoute(
        path: '/course/:id',
        builder: (_, s) => CourseDetailsScreen(courseId: s.pathParameters['id']!),
      ),
      GoRoute(
        path: '/quiz/:id',
        builder: (_, s) => QuizScreen(quizId: s.pathParameters['id']!),
      ),
      GoRoute(
        path: '/quiz-result',
        builder: (_, s) => QuizResultScreen(args: s.extra as QuizResultArgs),
      ),
      GoRoute(path: '/ai', builder: (_, __) => const AiAssistantScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/favorites', builder: (_, __) => const FavoritesScreen()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      GoRoute(path: '/statistics', builder: (_, __) => const StatisticsScreen()),
      GoRoute(path: '/leaderboard', builder: (_, __) => const LeaderboardScreen()),
      GoRoute(path: '/achievements', builder: (_, __) => const AchievementsScreen()),
      GoRoute(path: '/admin', builder: (_, __) => const AdminScreen()),
      GoRoute(
        path: '/chat/:peerId/:name',
        builder: (_, s) => ChatScreen(
          peerId: s.pathParameters['peerId']!,
          peerName: s.pathParameters['name']!,
        ),
      ),
    ],
    errorBuilder: (_, state) => Scaffold(
      body: Center(child: Text('صفحة غير موجودة: ${state.uri}')),
    ),
  );
}

/// مساعد للوصول لمزوّد المصادقة من السياق.
extension AuthContext on BuildContext {
  AuthProvider get authProvider => read<AuthProvider>();
}
