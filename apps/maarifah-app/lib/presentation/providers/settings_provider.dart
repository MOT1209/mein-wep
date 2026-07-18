import 'package:flutter/material.dart';

import '../../core/constants/app_constants.dart';
import '../../core/services/storage_service.dart';

/// مزوّد الإعدادات: الثيم واللغة (مع الحفظ المحلي).
class SettingsProvider extends ChangeNotifier {
  SettingsProvider(this._storage) {
    _load();
  }

  final StorageService _storage;

  ThemeMode _themeMode = ThemeMode.system;
  Locale _locale = const Locale('ar');

  ThemeMode get themeMode => _themeMode;
  Locale get locale => _locale;
  bool get isDark => _themeMode == ThemeMode.dark;

  void _load() {
    final t = _storage.getString(AppConstants.kThemeMode);
    _themeMode = switch (t) {
      'dark' => ThemeMode.dark,
      'light' => ThemeMode.light,
      _ => ThemeMode.system,
    };
    final l = _storage.getString(AppConstants.kLocale);
    if (l != null) _locale = Locale(l);
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    await _storage.setString(
      AppConstants.kThemeMode,
      switch (mode) {
        ThemeMode.dark => 'dark',
        ThemeMode.light => 'light',
        ThemeMode.system => 'system',
      },
    );
    notifyListeners();
  }

  Future<void> toggleDark(bool value) =>
      setThemeMode(value ? ThemeMode.dark : ThemeMode.light);

  Future<void> setLocale(Locale locale) async {
    _locale = locale;
    await _storage.setString(AppConstants.kLocale, locale.languageCode);
    notifyListeners();
  }

  Future<void> toggleLocale() =>
      setLocale(_locale.languageCode == 'ar' ? const Locale('en') : const Locale('ar'));
}
