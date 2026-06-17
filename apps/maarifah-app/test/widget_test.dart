import 'package:flutter_test/flutter_test.dart';

import 'package:maarifah_app/core/constants/app_constants.dart';
import 'package:maarifah_app/domain/entities/quiz.dart';
import 'package:maarifah_app/domain/usecases/usecases.dart';

void main() {
  group('EvaluateQuizUseCase', () {
    const quiz = Quiz(
      id: 'q',
      title: 'test',
      categoryId: 'ai',
      passScore: 60,
      questions: [
        Question(id: '1', text: 'a', options: ['x', 'y'], correctIndex: 0),
        Question(id: '2', text: 'b', options: ['x', 'y'], correctIndex: 1),
      ],
    );

    test('يحسب النتيجة بشكل صحيح', () {
      final result = const EvaluateQuizUseCase()(quiz, [0, 1]);
      expect(result.correctCount, 2);
      expect(result.scorePercent, 100);
      expect(result.passed, true);
    });

    test('يرسب عند تجاوز عتبة النجاح', () {
      final result = const EvaluateQuizUseCase()(quiz, [1, 1]);
      expect(result.correctCount, 1);
      expect(result.scorePercent, 50);
      expect(result.passed, false);
    });

    test('مكافأة XP عند النجاح', () {
      const usecase = EvaluateQuizUseCase();
      final passed = usecase(quiz, [0, 1]);
      expect(usecase.xpReward(passed), AppConstants.xpPerQuizPass);
    });
  });
}
