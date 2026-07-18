import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/app_widgets.dart';
import '../../providers/content_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../widgets/content_cards.dart';

/// شاشة تصنيف موحّدة (معلومات عامة / برمجة / ذكاء اصطناعي / دورات).
class CategoryScreen extends StatelessWidget {
  const CategoryScreen({super.key, required this.categoryId});
  final String categoryId;

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    final favorites = context.watch<FavoritesProvider>();
    final articles = content.articlesByCategory(categoryId);
    final courses = content.coursesByCategory(categoryId);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(categoryName(categoryId)),
          bottom: const TabBar(tabs: [Tab(text: 'المقالات'), Tab(text: 'الدورات')]),
        ),
        body: TabBarView(
          children: [
            articles.isEmpty
                ? const EmptyState(message: 'لا توجد مقالات بعد')
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: articles.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final a = articles[i];
                      return ArticleCard(
                        article: a,
                        isFavorite: favorites.isFavorite(a.id),
                        onFavorite: () => context.read<FavoritesProvider>().toggle(a.id),
                        onTap: () => context.push('/article/${a.id}'),
                      );
                    },
                  ),
            courses.isEmpty
                ? const EmptyState(message: 'لا توجد دورات بعد')
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.72,
                    ),
                    itemCount: courses.length,
                    itemBuilder: (_, i) {
                      final c = courses[i];
                      return CourseCard(
                        course: c,
                        width: double.infinity,
                        onTap: () => context.push('/course/${c.id}'),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }
}
