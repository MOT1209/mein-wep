import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/settings_provider.dart';

/// شاشة الإعدادات: الثيم، اللغة، حول التطبيق.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات')),
      body: ListView(
        children: [
          const _SectionTitle('المظهر'),
          SwitchListTile(
            secondary: const Icon(Icons.dark_mode_outlined),
            title: const Text('الوضع الليلي'),
            value: settings.isDark,
            onChanged: (v) => context.read<SettingsProvider>().toggleDark(v),
          ),
          ListTile(
            leading: const Icon(Icons.brightness_auto),
            title: const Text('اتباع النظام'),
            trailing: settings.themeMode == ThemeMode.system
                ? const Icon(Icons.check, color: AppColors.primary)
                : null,
            onTap: () => context.read<SettingsProvider>().setThemeMode(ThemeMode.system),
          ),
          const Divider(),
          const _SectionTitle('اللغة'),
          RadioListTile<String>(
            value: 'ar',
            groupValue: settings.locale.languageCode,
            title: const Text('العربية'),
            onChanged: (_) => context.read<SettingsProvider>().setLocale(const Locale('ar')),
          ),
          RadioListTile<String>(
            value: 'en',
            groupValue: settings.locale.languageCode,
            title: const Text('English'),
            onChanged: (_) => context.read<SettingsProvider>().setLocale(const Locale('en')),
          ),
          const Divider(),
          const _SectionTitle('حول'),
          const ListTile(
            leading: Icon(Icons.info_outline),
            title: Text('إصدار التطبيق'),
            trailing: Text(AppConstants.appVersion),
          ),
          const ListTile(
            leading: Icon(Icons.code),
            title: Text('بُني بـ Flutter • Clean Architecture'),
          ),
          const AboutListTile(
            icon: Icon(Icons.description_outlined),
            applicationName: 'معرفة',
            applicationVersion: AppConstants.appVersion,
            child: Text('الرخصة والمعلومات'),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(title,
          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
    );
  }
}
