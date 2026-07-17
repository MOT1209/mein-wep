import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/app_widgets.dart';
import '../../providers/content_provider.dart';
import '../../widgets/content_cards.dart';

/// تبويب الدورات.
class CoursesScreen extends StatelessWidget {
  const CoursesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('الدورات التعليمية')),
      body: content.loading
          ? const Center(child: CircularProgressIndicator())
          : content.courses.isEmpty
              ? const EmptyState(message: 'لا توجد دورات')
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.72,
                  ),
                  itemCount: content.courses.length,
                  itemBuilder: (_, i) {
                    final c = content.courses[i];
                    return CourseCard(
                      course: c,
                      width: double.infinity,
                      onTap: () => context.push('/course/${c.id}'),
                    );
                  },
                ),
    );
  }
}
