import 'package:flutter/material.dart';

/// نظام ترجمة بسيط معتمد على الخرائط (يدعم AR/EN).
class AppLocalizations {
  AppLocalizations(this.locale);
  final Locale locale;

  static AppLocalizations of(BuildContext context) =>
      Localizations.of<AppLocalizations>(context, AppLocalizations)!;

  static const LocalizationsDelegate<AppLocalizations> delegate = _Delegate();

  static const supportedLocales = [Locale('ar'), Locale('en')];

  static const Map<String, Map<String, String>> _values = {
    'ar': {
      'app_name': 'معرفة',
      'home': 'الرئيسية',
      'courses': 'الدورات',
      'quizzes': 'الاختبارات',
      'community': 'المجتمع',
      'profile': 'حسابي',
      'search': 'بحث',
      'general_knowledge': 'معلومات عامة',
      'programming': 'البرمجة',
      'ai': 'الذكاء الاصطناعي',
      'login': 'تسجيل الدخول',
      'register': 'إنشاء حساب',
      'logout': 'تسجيل الخروج',
      'email': 'البريد الإلكتروني',
      'password': 'كلمة المرور',
      'name': 'الاسم',
      'welcome': 'مرحباً بك',
      'get_started': 'ابدأ الآن',
      'skip': 'تخطّي',
      'next': 'التالي',
      'settings': 'الإعدادات',
      'dark_mode': 'الوضع الليلي',
      'language': 'اللغة',
      'notifications': 'الإشعارات',
      'favorites': 'المفضلة',
      'leaderboard': 'المتصدّرون',
      'achievements': 'الإنجازات',
      'statistics': 'الإحصائيات',
      'ai_assistant': 'المساعد الذكي',
      'admin_panel': 'لوحة التحكم',
      'start_quiz': 'ابدأ الاختبار',
      'continue_': 'متابعة',
      'level': 'المستوى',
      'no_account': 'ليس لديك حساب؟',
      'have_account': 'لديك حساب بالفعل؟',
    },
    'en': {
      'app_name': 'Maarifah',
      'home': 'Home',
      'courses': 'Courses',
      'quizzes': 'Quizzes',
      'community': 'Community',
      'profile': 'Profile',
      'search': 'Search',
      'general_knowledge': 'General',
      'programming': 'Programming',
      'ai': 'AI',
      'login': 'Login',
      'register': 'Sign Up',
      'logout': 'Logout',
      'email': 'Email',
      'password': 'Password',
      'name': 'Name',
      'welcome': 'Welcome',
      'get_started': 'Get Started',
      'skip': 'Skip',
      'next': 'Next',
      'settings': 'Settings',
      'dark_mode': 'Dark Mode',
      'language': 'Language',
      'notifications': 'Notifications',
      'favorites': 'Favorites',
      'leaderboard': 'Leaderboard',
      'achievements': 'Achievements',
      'statistics': 'Statistics',
      'ai_assistant': 'AI Assistant',
      'admin_panel': 'Admin Panel',
      'start_quiz': 'Start Quiz',
      'continue_': 'Continue',
      'level': 'Level',
      'no_account': "Don't have an account?",
      'have_account': 'Already have an account?',
    },
  };

  String t(String key) => _values[locale.languageCode]?[key] ?? key;
}

class _Delegate extends LocalizationsDelegate<AppLocalizations> {
  const _Delegate();

  @override
  bool isSupported(Locale locale) => ['ar', 'en'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async => AppLocalizations(locale);

  @override
  bool shouldReload(_Delegate old) => false;
}
