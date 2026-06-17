import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/favorites_provider.dart';

/// شاشة الملف الشخصي وقائمة الوصول للأقسام.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    if (user == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: AppBar(
        title: const Text('حسابي'),
        actions: [
          IconButton(icon: const Icon(Icons.settings_outlined), onPressed: () => context.push('/settings')),
        ],
      ),
      body: ListView(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: AppColors.primaryGradient),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 44,
                  backgroundColor: Colors.white,
                  child: Text(
                    user.name.characters.first,
                    style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
                const SizedBox(height: 12),
                Text(user.name,
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                Text(user.email, style: const TextStyle(color: Colors.white70)),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _Stat(label: 'المستوى', value: '${user.level}'),
                    _Stat(label: 'النقاط', value: '${user.xp}'),
                    _Stat(label: 'السلسلة', value: '${user.streak}🔥'),
                  ],
                ),
                const SizedBox(height: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('المستوى ${user.level} • ${user.xpInLevel}/${AppConstants.xpPerLevel}',
                        style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: user.levelProgress,
                        minHeight: 8,
                        backgroundColor: Colors.white24,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          _Tile(icon: Icons.bar_chart, label: 'الإحصائيات', onTap: () => context.push('/statistics')),
          _Tile(icon: Icons.emoji_events, label: 'لوحة المتصدّرين', onTap: () => context.push('/leaderboard')),
          _Tile(icon: Icons.military_tech, label: 'الإنجازات', onTap: () => context.push('/achievements')),
          _Tile(icon: Icons.favorite, label: 'المفضلة', onTap: () => context.push('/favorites')),
          _Tile(icon: Icons.notifications, label: 'الإشعارات', onTap: () => context.push('/notifications')),
          _Tile(icon: Icons.auto_awesome, label: 'المساعد الذكي', onTap: () => context.push('/ai')),
          if (auth.isAdmin)
            _Tile(
              icon: Icons.admin_panel_settings,
              label: 'لوحة التحكم',
              color: AppColors.secondary,
              onTap: () => context.push('/admin'),
            ),
          const Divider(),
          _Tile(
            icon: Icons.logout,
            label: 'تسجيل الخروج',
            color: AppColors.error,
            onTap: () async {
              context.read<FavoritesProvider>().clear();
              await context.read<AuthProvider>().logout();
              if (context.mounted) context.go('/login');
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ],
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.icon, required this.label, required this.onTap, this.color});
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: color ?? AppColors.primary),
      title: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
      trailing: const Icon(Icons.arrow_forward_ios, size: 14),
      onTap: onTap,
    );
  }
}
