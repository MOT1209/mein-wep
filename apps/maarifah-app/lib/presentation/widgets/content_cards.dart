import 'package:flutter/material.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_widgets.dart';
import '../../domain/entities/article.dart';
import '../../domain/entities/course.dart';

/// لون التصنيف.
Color categoryColor(String id) => switch (id) {
      'programming' => AppColors.catProgramming,
      'ai' => AppColors.catAi,
      'courses' => AppColors.catCourses,
      _ => AppColors.catGeneral,
    };

/// اسم التصنيف بالعربية.
String categoryName(String id) =>
    ContentCategory.values.firstWhere((c) => c.id == id, orElse: () => ContentCategory.general).ar;

IconData categoryIcon(String id) => switch (id) {
      'programming' => Icons.code,
      'ai' => Icons.psychology,
      'courses' => Icons.menu_book,
      _ => Icons.lightbulb_outline,
    };

/// بطاقة مقال.
class ArticleCard extends StatelessWidget {
  const ArticleCard({super.key, required this.article, required this.onTap, this.onFavorite, this.isFavorite = false});

  final Article article;
  final VoidCallback onTap;
  final VoidCallback? onFavorite;
  final bool isFavorite;

  @override
  Widget build(BuildContext context) {
    final color = categoryColor(article.categoryId);
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(categoryIcon(article.categoryId), color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(article.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(article.summary,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: AppColors.lightTextSecondary, fontSize: 13)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.schedule, size: 14, color: AppColors.lightTextSecondary),
                        const SizedBox(width: 4),
                        Text(Formatters.duration(article.readMinutes),
                            style: const TextStyle(fontSize: 12, color: AppColors.lightTextSecondary)),
                        const SizedBox(width: 12),
                        const Icon(Icons.remove_red_eye_outlined, size: 14, color: AppColors.lightTextSecondary),
                        const SizedBox(width: 4),
                        Text(Formatters.compact(article.views),
                            style: const TextStyle(fontSize: 12, color: AppColors.lightTextSecondary)),
                      ],
                    ),
                  ],
                ),
              ),
              if (onFavorite != null)
                IconButton(
                  icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: isFavorite ? AppColors.error : AppColors.lightTextSecondary),
                  onPressed: onFavorite,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// بطاقة دورة (أفقية للقوائم العرضية).
class CourseCard extends StatelessWidget {
  const CourseCard({super.key, required this.course, required this.onTap, this.width = 260});

  final Course course;
  final VoidCallback onTap;
  final double width;

  @override
  Widget build(BuildContext context) {
    final color = categoryColor(course.categoryId);
    return SizedBox(
      width: width,
      child: Card(
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 100,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [color, color.withOpacity(0.6)]),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                ),
                child: Center(child: Icon(categoryIcon(course.categoryId), color: Colors.white, size: 44)),
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CategoryChip(label: course.level.ar, color: color),
                    const SizedBox(height: 8),
                    Text(course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 16, color: AppColors.warning),
                        const SizedBox(width: 4),
                        Text('${course.rating}', style: const TextStyle(fontSize: 13)),
                        const SizedBox(width: 12),
                        const Icon(Icons.play_lesson_outlined, size: 16, color: AppColors.lightTextSecondary),
                        const SizedBox(width: 4),
                        Text('${course.lessons.length} درس',
                            style: const TextStyle(fontSize: 13, color: AppColors.lightTextSecondary)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
