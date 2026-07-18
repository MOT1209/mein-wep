import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/app_widgets.dart';
import '../../providers/content_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../widgets/content_cards.dart';

/// شاشة المفضلة.
class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final favorites = context.watch<FavoritesProvider>();
    final content = context.watch<ContentProvider>();
    final items = content.articles.where((a) => favorites.isFavorite(a.id)).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('المفضلة')),
      body: items.isEmpty
          ? const EmptyState(message: 'لا توجد عناصر في المفضلة', icon: Icons.favorite_border)
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, i) {
                final a = items[i];
                return ArticleCard(
                  article: a,
                  isFavorite: true,
                  onFavorite: () => context.read<FavoritesProvider>().toggle(a.id),
                  onTap: () => context.push('/article/${a.id}'),
                );
              },
            ),
    );
  }
}
