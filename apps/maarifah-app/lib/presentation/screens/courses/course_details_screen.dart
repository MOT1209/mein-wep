import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../domain/entities/course.dart';
import '../../providers/auth_provider.dart';
import '../../providers/content_provider.dart';
import '../../widgets/content_cards.dart';

/// شاشة تفاصيل الدورة مع متابعة الدروس وكسب النقاط.
class CourseDetailsScreen extends StatefulWidget {
  const CourseDetailsScreen({super.key, required this.courseId});
  final String courseId;

  @override
  State<CourseDetailsScreen> createState() => _CourseDetailsScreenState();
}

class _CourseDetailsScreenState extends State<CourseDetailsScreen> {
  final Set<String> _completed = {};

  Future<void> _completeLesson(Lesson lesson) async {
    if (_completed.contains(lesson.id)) return;
    setState(() => _completed.add(lesson.id));
    final levels = await context.read<AuthProvider>().awardXp(AppConstants.xpPerLesson);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.success,
        content: Text(levels > 0
            ? '🎉 +${AppConstants.xpPerLesson} XP — وصلت لمستوى جديد!'
            : '+${AppConstants.xpPerLesson} XP أحسنت!'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    final Course? course =
        content.courses.where((c) => c.id == widget.courseId).cast<Course?>().firstOrNull;
    if (course == null) {
      return const Scaffold(body: EmptyState(message: 'الدورة غير موجودة'));
    }
    final color = categoryColor(course.categoryId);
    final progress = course.lessons.isEmpty ? 0.0 : _completed.length / course.lessons.length;

    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل الدورة')),
      body: ListView(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [color, color.withOpacity(0.7)]),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(categoryIcon(course.categoryId), color: Colors.white, size: 40),
                const SizedBox(height: 12),
                Text(course.title,
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.person, color: Colors.white70, size: 16),
                    const SizedBox(width: 4),
                    Text(course.instructor, style: const TextStyle(color: Colors.white70)),
                    const SizedBox(width: 16),
                    const Icon(Icons.star, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text('${course.rating}', style: const TextStyle(color: Colors.white)),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _Info(icon: Icons.play_lesson, label: '${course.lessons.length} درس'),
                    const SizedBox(width: 16),
                    _Info(icon: Icons.schedule, label: Formatters.duration(course.totalMinutes)),
                    const SizedBox(width: 16),
                    _Info(icon: Icons.signal_cellular_alt, label: course.level.ar),
                  ],
                ),
                const SizedBox(height: 16),
                Text(course.description, style: const TextStyle(height: 1.7)),
                const SizedBox(height: 20),
                Text('التقدّم ${(progress * 100).round()}%',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(value: progress, minHeight: 8, color: color),
                ),
                const SizedBox(height: 20),
                const Text('محتوى الدورة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ...course.lessons.asMap().entries.map((e) {
                  final lesson = e.value;
                  final done = _completed.contains(lesson.id);
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: done ? AppColors.success : color.withOpacity(0.15),
                        child: done
                            ? const Icon(Icons.check, color: Colors.white)
                            : Text('${e.key + 1}', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
                      ),
                      title: Text(lesson.title),
                      subtitle: Text('${lesson.content}\n${Formatters.duration(lesson.durationMinutes)}'),
                      isThreeLine: true,
                      trailing: done
                          ? const Icon(Icons.verified, color: AppColors.success)
                          : const Icon(Icons.play_circle_outline),
                      onTap: () => _completeLesson(lesson),
                    ),
                  );
                }),
                const SizedBox(height: 16),
                if (progress >= 1.0 && course.hasCertificate)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.success),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.workspace_premium, color: AppColors.success, size: 32),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text('🎓 تهانينا! أكملت الدورة وحصلت على الشهادة.',
                              style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Info extends StatelessWidget {
  const _Info({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.lightTextSecondary),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: AppColors.lightTextSecondary, fontSize: 13)),
      ],
    );
  }
}
