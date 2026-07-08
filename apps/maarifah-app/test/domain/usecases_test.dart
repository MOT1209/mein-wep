import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:maarifah_app/core/constants/app_constants.dart';
import 'package:maarifah_app/domain/entities/quiz.dart';
import 'package:maarifah_app/domain/usecases/usecases.dart';
import 'package:maarifah_app/domain/repositories/repositories.dart';
import '../helpers/mocks.dart';

void main() {
  group('EvaluateQuizUseCase', () {
    const quiz = Quiz(
      id: 'q',
      title: 'اختبار',
      categoryId: 'ai',
      passScore: 60,
      questions: [
        Question(id: '1', text: 'س1', options: ['أ', 'ب'], correctIndex: 0),
        Question(id: '2', text: 'س2', options: ['أ', 'ب'], correctIndex: 1),
        Question(id: '3', text: 'س3', options: ['أ', 'ب'], correctIndex: 0),
      ],
    );

    test('يحسب النتيجة 100%', () {
      const usecase = EvaluateQuizUseCase();
      final result = usecase(quiz, [0, 1, 0]);
      expect(result.correctCount, 3);
      expect(result.scorePercent, 100);
      expect(result.passed, isTrue);
    });

    test('يرسب تحت عتبة النجاح', () {
      const usecase = EvaluateQuizUseCase();
      final result = usecase(quiz, [1, 0, 1]);
      expect(result.correctCount, 0);
      expect(result.passed, isFalse);
    });

    test('xpReward يعطي نقاط فقط عند النجاح', () {
      const usecase = EvaluateQuizUseCase();
      final passed = usecase(quiz, [0, 1, 0]);
      final failed = usecase(quiz, [1, 0, 1]);
      expect(usecase.xpReward(passed), AppConstants.xpPerQuizPass);
      expect(usecase.xpReward(failed), 0);
    });

    test('يجيب إجابات ناقصة كخطأ', () {
      const usecase = EvaluateQuizUseCase();
      final result = usecase(quiz, [0]);
      expect(result.correctCount, 1);
      expect(result.answers.length, 3);
    });
  });

  group('LoginUseCase', () {
    test('يستدعي repo.login', () async {
      final repo = MockAuthRepository();
      const usecase = LoginUseCase(repo);
      await usecase('a@b.com', '123456');
      verify(repo.login('a@b.com', '123456')).called(1);
    });
  });

  group('RegisterUseCase', () {
    test('يستدعي repo.register', () async {
      final repo = MockAuthRepository();
      const usecase = RegisterUseCase(repo);
      await usecase('راشد', 'r@test.com', '123456');
      verify(repo.register('راشد', 'r@test.com', '123456')).called(1);
    });
  });

  group('AwardXpUseCase', () {
    test('يستدعي repo.addXp بالمعاملات الصحيحة', () async {
      final repo = MockAuthRepository();
      const usecase = AwardXpUseCase(repo);
      await usecase('u1', 100);
      verify(repo.addXp('u1', 100)).called(1);
    });
  });
}
