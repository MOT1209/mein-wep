import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/app_widgets.dart';
import '../../providers/content_provider.dart';
import '../../widgets/content_cards.dart';

/// تبويب الاختبارات.
class QuizzesScreen extends StatelessWidget {
  const QuizzesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('الاختبارات')),
      body: content.loading
          ? const Center(child: CircularProgressIndicator())
          : content.quizzes.isEmpty
              ? const EmptyState(message: 'لا توجد اختبارات')
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: content.quizzes.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) {
                    final q = content.quizzes[i];
                    final color = categoryColor(q.categoryId);
                    return Card(
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12),
                        leading: CircleAvatar(
                          backgroundColor: color.withOpacity(0.15),
                          child: Icon(Icons.quiz, color: color),
                        ),
                        title: Text(q.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${q.questions.length} أسئلة • النجاح ${q.passScore}%'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => context.push('/quiz/${q.id}'),
                      ),
                    );
                  },
                ),
    );
  }
}
