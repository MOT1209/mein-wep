/// ثوابت التطبيق العامة.
class AppConstants {
  AppConstants._();

  static const String appName = 'معرفة';
  static const String appNameEn = 'Maarifah';
  static const String appVersion = '1.0.0';

  // مفاتيح التخزين المحلي
  static const String kThemeMode = 'theme_mode';
  static const String kLocale = 'locale';
  static const String kOnboardingSeen = 'onboarding_seen';
  static const String kCurrentUserId = 'current_user_id';
  static const String kUsers = 'users_db';
  static const String kFavorites = 'favorites_db';
  static const String kUserProgress = 'user_progress_db';

  // نظام التحفيز
  static const int xpPerLesson = 50;
  static const int xpPerQuizPass = 100;
  static const int xpPerDailyLogin = 20;
  static const int xpPerLevel = 500;

  // الحسابات التجريبية
  static const String demoUserEmail = 'user@maarifah.app';
  static const String demoUserPassword = '123456';
  static const String demoAdminEmail = 'admin@maarifah.app';
  static const String demoAdminPassword = 'admin123';

  static const Duration splashDuration = Duration(milliseconds: 2200);
}

/// تصنيفات المحتوى الرئيسية.
enum ContentCategory {
  general('general', 'معلومات عامة', 'General Knowledge'),
  programming('programming', 'البرمجة', 'Programming'),
  ai('ai', 'الذكاء الاصطناعي', 'Artificial Intelligence'),
  courses('courses', 'دورات', 'Courses');

  const ContentCategory(this.id, this.ar, this.en);
  final String id;
  final String ar;
  final String en;
}

/// أدوار المستخدمين.
enum UserRole { user, admin }
