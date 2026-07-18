import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../providers/auth_provider.dart';
import '../../providers/content_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../../core/services/notification_service.dart';
import '../../widgets/content_cards.dart';

/// الشاشة الرئيسية: ترحيب، تصنيفات، دورات مميّزة، أحدث المقالات.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final content = context.watch<ContentProvider>();
    final favorites = context.watch<FavoritesProvider>();
    final user = auth.user;

    return Scaffold(
      body: SafeArea(
        child: content.loading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: () => context.read<ContentProvider>().load(),
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _Header(userName: user?.name ?? '', userXp: user?.xp ?? 0),
                    const SizedBox(height: 16),
                    _SearchBar(onTap: () => context.push('/search')),
                    const SizedBox(height: 20),
                    _Categories(),
                    const SizedBox(height: 8),
                    SectionHeader(
                      title: 'دورات مميّزة',
                      onSeeAll: () => context.push('/category/${ContentCategory.courses.id}'),
                    ),
                    SizedBox(
                      height: 230,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: content.courses.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (_, i) {
                          final c = content.courses[i];
                          return CourseCard(course: c, onTap: () => context.push('/course/${c.id}'));
                        },
                      ),
                    ),
                    const SizedBox(height: 8),
                    const SectionHeader(title: 'أحدث المقالات'),
                    ...content.articles.take(5).map(
                          (a) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: ArticleCard(
                              article: a,
                              isFavorite: favorites.isFavorite(a.id),
                              onFavorite: () => context.read<FavoritesProvider>().toggle(a.id),
                              onTap: () => context.push('/article/${a.id}'),
                            ),
                          ),
                        ),
                  ],
                ),
              ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.userName, required this.userXp});
  final String userName;
  final int userXp;

  @override
  Widget build(BuildContext context) {
    final notif = context.watch<NotificationService>();
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('أهلاً، $userName 👋',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              const Text('ماذا تريد أن تتعلّم اليوم؟',
                  style: TextStyle(color: AppColors.lightTextSecondary)),
            ],
          ),
        ),
        XpBadge(xp: userXp),
        const SizedBox(width: 4),
        Stack(
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () => context.push('/notifications'),
            ),
            if (notif.unreadCount > 0)
              Positioned(
                right: 6,
                top: 6,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                  child: Text('${notif.unreadCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 10)),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _SearchBar extends StatelessWidget {
  const _SearchBar({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.lightBorder),
        ),
        child: const Row(
          children: [
            Icon(Icons.search, color: AppColors.lightTextSecondary),
            SizedBox(width: 12),
            Text('ابحث عن مقال أو دورة...', style: TextStyle(color: AppColors.lightTextSecondary)),
          ],
        ),
      ),
    );
  }
}

class _Categories extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const cats = ContentCategory.values;
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.7,
      children: cats.map((c) {
        final color = categoryColor(c.id);
        return InkWell(
          onTap: () => context.push('/category/${c.id}'),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withOpacity(0.10),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withOpacity(0.25)),
            ),
            child: Row(
              children: [
                Icon(categoryIcon(c.id), color: color, size: 32),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(c.ar,
                      style: TextStyle(fontWeight: FontWeight.bold, color: color)),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
