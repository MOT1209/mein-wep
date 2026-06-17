import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../domain/entities/quiz.dart';
import '../../providers/auth_provider.dart';

/// وسيط تمرير نتيجة الاختبار للراوتر.
class QuizResultArgs {
  const QuizResultArgs(this.result);
  final QuizResult result;
}

/// شاشة نتيجة الاختبار مع منح النقاط ومراجعة الإجابات.
class QuizResultScreen extends StatefulWidget {
  const QuizResultScreen({super.key, required this.args});
  final QuizResultArgs args;

  @override
  State<QuizResultScreen> createState() => _QuizResultScreenState();
}

class _QuizResultScreenState extends State<QuizResultScreen> {
  int _levelsGained = 0;

  @override
  void initState() {
    super.initState();
    if (widget.args.result.passed) {
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        final gained = await context.read<AuthProvider>().awardXp(AppConstants.xpPerQuizPass);
        if (mounted) setState(() => _levelsGained = gained);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final result = widget.args.result;
    final passed = result.passed;
    final color = passed ? AppColors.success : AppColors.error;

    return Scaffold(
      appBar: AppBar(title: const Text('النتيجة'), automaticallyImplyLeading: false),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 12),
          Center(
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(color: color.withOpacity(0.12), shape: BoxShape.circle),
              child: Center(
                child: Text('${result.scorePercent}%',
                    style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: color)),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(passed ? '🎉 أحسنت! لقد نجحت' : '😔 لم تنجح هذه المرة',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 8),
          Text('أجبت بشكل صحيح على ${result.correctCount} من ${result.total}',
              textAlign: TextAlign.center, style: const TextStyle(color: AppColors.lightTextSecondary)),
          if (passed) ...[
            const SizedBox(height: 12),
            const Center(child: XpBadge(xp: AppConstants.xpPerQuizPass)),
            if (_levelsGained > 0)
              const Padding(
                padding: EdgeInsets.only(top: 8),
                child: Text('🚀 وصلت إلى مستوى جديد!', textAlign: TextAlign.center),
              ),
          ],
          const Divider(height: 40),
          const Text('مراجعة الإجابات', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...result.quiz.questions.asMap().entries.map((e) {
            final i = e.key;
            final q = e.value;
            final userAnswer = i < result.answers.length ? result.answers[i] : -1;
            final correct = q.isCorrect(userAnswer);
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(correct ? Icons.check_circle : Icons.cancel,
                            color: correct ? AppColors.success : AppColors.error, size: 20),
                        const SizedBox(width: 8),
                        Expanded(child: Text(q.text, style: const TextStyle(fontWeight: FontWeight.bold))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('الإجابة الصحيحة: ${q.options[q.correctIndex]}',
                        style: const TextStyle(color: AppColors.success)),
                    if (q.explanation.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(q.explanation, style: const TextStyle(color: AppColors.lightTextSecondary, fontSize: 13)),
                    ],
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 20),
          PrimaryButton(label: 'العودة للاختبارات', onPressed: () => context.go('/home')),
        ],
      ),
    );
  }
}
