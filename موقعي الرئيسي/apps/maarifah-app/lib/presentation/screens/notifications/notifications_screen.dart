import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../domain/entities/app_notification.dart';
import '../../../core/services/notification_service.dart';

/// شاشة الإشعارات.
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  ({IconData icon, Color color}) _style(NotificationType t) => switch (t) {
        NotificationType.content => (icon: Icons.article, color: AppColors.info),
        NotificationType.reminder => (icon: Icons.alarm, color: AppColors.warning),
        NotificationType.achievement => (icon: Icons.emoji_events, color: AppColors.secondary),
        NotificationType.social => (icon: Icons.people, color: AppColors.success),
        NotificationType.system => (icon: Icons.info, color: AppColors.primary),
      };

  @override
  Widget build(BuildContext context) {
    final service = context.watch<NotificationService>();
    return Scaffold(
      appBar: AppBar(
        title: const Text('الإشعارات'),
        actions: [
          if (service.items.isNotEmpty)
            TextButton(
              onPressed: () => context.read<NotificationService>().markAllRead(),
              child: const Text('تعليم الكل'),
            ),
        ],
      ),
      body: service.items.isEmpty
          ? const EmptyState(message: 'لا توجد إشعارات', icon: Icons.notifications_off_outlined)
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: service.items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) {
                final AppNotification n = service.items[i];
                final s = _style(n.type);
                return Card(
                  color: n.isRead ? null : s.color.withOpacity(0.06),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: s.color.withOpacity(0.15),
                      child: Icon(s.icon, color: s.color),
                    ),
                    title: Text(n.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${n.body}\n${Formatters.timeAgo(n.createdAt)}'),
                    isThreeLine: true,
                    trailing: n.isRead ? null : const Icon(Icons.circle, size: 10, color: AppColors.primary),
                    onTap: () => context.read<NotificationService>().markRead(n.id),
                  ),
                );
              },
            ),
    );
  }
}
