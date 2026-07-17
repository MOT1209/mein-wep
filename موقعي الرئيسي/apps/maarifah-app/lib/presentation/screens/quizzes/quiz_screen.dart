import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../domain/entities/quiz.dart';
import '../../../domain/usecases/usecases.dart';
import '../../providers/content_provider.dart';
import 'quiz_result_screen.dart';

/// شاشة تشغيل الاختبار سؤالاً سؤالاً.
class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key, required this.quizId});
  final String quizId;

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _current = 0;
  late List<int> _answers;
  bool _init = false;

  Quiz? _quiz;

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    _quiz ??= content.quizzes.where((q) => q.id == widget.quizId).cast<Quiz?>().firstOrNull;
    final quiz = _quiz;
    if (quiz == null) {
      return const Scaffold(body: EmptyState(message: 'الاختبار غير موجود'));
    }
    if (!_init) {
      _answers = List.filled(quiz.questions.length, -1);
      _init = true;
    }

    final question = quiz.questions[_current];
    final progress = (_current + 1) / quiz.questions.length;
    final isLast = _current == quiz.questions.length - 1;

    return Scaffold(
      appBar: AppBar(
        title: Text('سؤال ${_current + 1}/${quiz.questions.length}'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(value: progress, minHeight: 4),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(question.text,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.separated(
                itemCount: question.options.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, i) {
                  final selected = _answers[_current] == i;
                  return InkWell(
                    onTap: () => setState(() => _answers[_current] = i),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: selected ? AppColors.primary.withOpacity(0.1) : Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: selected ? AppColors.primary : AppColors.lightBorder,
                          width: selected ? 1.6 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(selected ? Icons.radio_button_checked : Icons.radio_button_off,
                              color: selected ? AppColors.primary : AppColors.lightTextSecondary),
                          const SizedBox(width: 12),
                          Expanded(child: Text(question.options[i], style: const TextStyle(fontSize: 16))),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Row(
              children: [
                if (_current > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _current--),
                      child: const Text('السابق'),
                    ),
                  ),
                if (_current > 0) const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(
                    label: isLast ? 'إنهاء' : 'التالي',
                    onPressed: _answers[_current] == -1
                        ? null
                        : () {
                            if (isLast) {
                              _finish(quiz);
                            } else {
                              setState(() => _current++);
                            }
                          },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _finish(Quiz quiz) {
    final result = const EvaluateQuizUseCase()(quiz, _answers);
    context.pushReplacement('/quiz-result', extra: QuizResultArgs(result));
  }
}
