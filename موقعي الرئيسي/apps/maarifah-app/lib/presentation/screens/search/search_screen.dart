import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/app_widgets.dart';
import '../../../domain/entities/article.dart';
import '../../providers/content_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../widgets/content_cards.dart';

/// شاشة البحث الذكي.
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    final favorites = context.watch<FavoritesProvider>();
    final List<Article> results = _query.isEmpty ? [] : content.search(_query);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'ابحث بالذكاء الاصطناعي...',
            border: InputBorder.none,
          ),
          onChanged: (v) => setState(() => _query = v),
        ),
        actions: [
          if (_query.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _controller.clear();
                setState(() => _query = '');
              },
            ),
        ],
      ),
      body: _query.isEmpty
          ? const EmptyState(message: 'اكتب كلمة للبحث', icon: Icons.search)
          : results.isEmpty
              ? const EmptyState(message: 'لا توجد نتائج مطابقة')
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: results.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    final a = results[i];
                    return ArticleCard(
                      article: a,
                      isFavorite: favorites.isFavorite(a.id),
                      onFavorite: () => context.read<FavoritesProvider>().toggle(a.id),
                      onTap: () => context.push('/article/${a.id}'),
                    );
                  },
                ),
    );
  }
}
