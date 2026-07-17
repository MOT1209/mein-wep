import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'core/services/storage_service.dart';
import 'core/theme/app_theme.dart';
import 'localization/app_localizations.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/settings_provider.dart';
import 'routes/app_router.dart';

/// جذر التطبيق: يربط الثيم واللغة والتوجيه.
class MaarifahApp extends StatefulWidget {
  const MaarifahApp({super.key, required this.storage});
  final StorageService storage;

  @override
  State<MaarifahApp> createState() => _MaarifahAppState();
}

class _MaarifahAppState extends State<MaarifahApp> {
  late final AppRouter _appRouter;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    _appRouter = AppRouter(auth, widget.storage);
    auth.bootstrap();
  }

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();
    return MaterialApp.router(
      title: 'معرفة',
      debugShowCheckedModeBanner: false,
      themeMode: settings.themeMode,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      locale: settings.locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: _appRouter.router,
      builder: (context, child) {
        // فرض اتجاه RTL للعربية.
        final isRtl = settings.locale.languageCode == 'ar';
        return Directionality(
          textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
          child: child!,
        );
      },
    );
  }
}
