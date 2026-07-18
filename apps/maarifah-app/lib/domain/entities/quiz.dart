import 'package:equatable/equatable.dart';

/// سؤال اختبار متعدد الخيارات.
class Question extends Equatable {
  const Question({
    required this.id,
    required this.text,
    required this.options,
    required this.correctIndex,
    this.explanation = '',
  });

  final String id;
  final String text;
  final List<String> options;
  final int correctIndex;
  final String explanation;

  bool isCorrect(int index) => index == correctIndex;

  @override
  List<Object?> get props => [id];
}

/// كيان الاختبار.
class Quiz extends Equatable {
  const Quiz({
    required this.id,
    required this.title,
    required this.categoryId,
    required this.questions,
    this.description = '',
    this.passScore = 60,
  });

  final String id;
  final String title;
  final String categoryId;
  final List<Question> questions;
  final String description;
  final int passScore;

  @override
  List<Object?> get props => [id];
}

/// نتيجة محاولة اختبار.
class QuizResult {
  const QuizResult({
    required this.quiz,
    required this.correctCount,
    required this.total,
    required this.answers,
  });

  final Quiz quiz;
  final int correctCount;
  final int total;
  final List<int> answers; // -1 يعني بدون إجابة

  int get scorePercent => total == 0 ? 0 : ((correctCount / total) * 100).round();
  bool get passed => scorePercent >= quiz.passScore;
}
