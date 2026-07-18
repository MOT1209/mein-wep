import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../domain/entities/article.dart';
import '../../providers/content_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../widgets/content_cards.dart';

/// شاشة تفاصيل المقال.
class ArticleDetailScreen extends StatelessWidget {
  const ArticleDetailScreen({super.key, required this.articleId});
  final String articleId;

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    final favorites = context.watch<FavoritesProvider>();
    final Article? article =
        content.articles.where((a) => a.id == articleId).cast<Article?>().firstOrNull;

    if (article == null) {
      return const Scaffold(body: EmptyState(message: 'المقال غير موجود'));
    }
    final color = categoryColor(article.categoryId);
    final fav = favorites.isFavorite(article.id);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: color,
            actions: [
              IconButton(
                icon: Icon(fav ? Icons.favorite : Icons.favorite_border, color: Colors.white),
                onPressed: () => context.read<FavoritesProvider>().toggle(article.id),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [color, color.withOpacity(0.6)]),
                ),
                child: Center(child: Icon(categoryIcon(article.categoryId), size: 80, color: Colors.white)),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                CategoryChip(label: categoryName(article.categoryId), color: color),
                const SizedBox(height: 12),
                Text(article.title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const CircleAvatar(radius: 16, child: Icon(Icons.person, size: 18)),
                    const SizedBox(width: 8),
                    Text(article.author, style: const TextStyle(fontWeight: FontWeight.w600)),
                    const Spacer(),
                    const Icon(Icons.schedule, size: 16, color: AppColors.lightTextSecondary),
                    const SizedBox(width: 4),
                    Text(Formatters.duration(article.readMinutes),
                        style: const TextStyle(color: AppColors.lightTextSecondary, fontSize: 13)),
                  ],
                ),
                const Divider(height: 32),
                Text(article.content, style: const TextStyle(fontSize: 16, height: 1.8)),
                const SizedBox(height: 20),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: article.tags
                      .map((t) => Chip(label: Text('#$t'), visualDensity: VisualDensity.compact))
                      .toList(),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    _Stat(icon: Icons.remove_red_eye_outlined, value: Formatters.compact(article.views)),
                    const SizedBox(width: 20),
                    _Stat(icon: Icons.favorite_border, value: Formatters.compact(article.likes)),
                  ],
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.icon, required this.value});
  final IconData icon;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.lightTextSecondary),
        const SizedBox(width: 6),
        Text(value, style: const TextStyle(color: AppColors.lightTextSecondary)),
      ],
    );
  }
}
