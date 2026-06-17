import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../domain/entities/achievement.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gamification_provider.dart';

/// شاشة الإنجازات والشارات.
class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final game = context.watch<GamificationProvider>();
    final user = context.watch<AuthProvider>().user!;

    return Scaffold(
      appBar: AppBar(title: const Text('الإنجازات')),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.95,
        ),
        itemCount: game.achievements.length,
        itemBuilder: (_, i) {
          final Achievement a = game.achievements[i];
          final unlocked = game.isUnlocked(a, user);
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: unlocked ? a.color.withOpacity(0.1) : Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: unlocked ? a.color : AppColors.lightBorder),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: unlocked ? a.color.withOpacity(0.2) : AppColors.lightBorder,
                      child: Icon(a.icon, size: 32, color: unlocked ? a.color : AppColors.lightTextSecondary),
                    ),
                    if (!unlocked)
                      const Positioned(
                        right: 0,
                        bottom: 0,
                        child: CircleAvatar(radius: 12, backgroundColor: Colors.black54, child: Icon(Icons.lock, size: 14, color: Colors.white)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(a.title,
                    textAlign: TextAlign.center,
                    style: TextStyle(fontWeight: FontWeight.bold, color: unlocked ? a.color : null)),
                const SizedBox(height: 4),
                Text(a.description,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 12, color: AppColors.lightTextSecondary)),
                const SizedBox(height: 4),
                if (!unlocked)
                  Text('يتطلب ${a.requiredXp} XP',
                      style: const TextStyle(fontSize: 11, color: AppColors.lightTextSecondary)),
              ],
            ),
          );
        },
      ),
    );
  }
}
