import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gamification_provider.dart';

/// لوحة المتصدّرين.
class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final game = context.watch<GamificationProvider>();
    final me = context.watch<AuthProvider>().user;
    final list = game.leaderboard;

    return Scaffold(
      appBar: AppBar(title: const Text('لوحة المتصدّرين')),
      body: list.isEmpty
          ? const EmptyState(message: 'لا توجد بيانات')
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (_, i) {
                final u = list[i];
                final rank = i + 1;
                final isMe = u.id == me?.id;
                final medal = switch (rank) {
                  1 => '🥇',
                  2 => '🥈',
                  3 => '🥉',
                  _ => '$rank',
                };
                return Card(
                  color: isMe ? AppColors.primary.withOpacity(0.08) : null,
                  child: ListTile(
                    leading: SizedBox(
                      width: 36,
                      child: Center(
                        child: Text(medal,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    title: Text(isMe ? '${u.name} (أنت)' : u.name,
                        style: TextStyle(fontWeight: isMe ? FontWeight.bold : FontWeight.w600)),
                    subtitle: Text('المستوى ${u.level}'),
                    trailing: XpBadge(xp: u.xp),
                  ),
                );
              },
            ),
    );
  }
}
