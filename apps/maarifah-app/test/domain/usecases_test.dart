import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/core/constants/app_constants.dart';
import 'package:maarifah_app/domain/entities/quiz.dart';
import 'package:maarifah_app/domain/usecases/usecases.dart';
import 'package:maarifah_app/domain/entities/user.dart';
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
  });

  group('LoginUseCase', () {
    test('يستدعي repo.login', () async {
      final repo = MockAuthRepository();
      repo.returnsOnLogin(const User(id: 'u1', name: 'ت', email: 'a@b.com'));

      final usecase = LoginUseCase(repo);
      final result = await usecase('a@b.com', '123456');
      expect(result.email, 'a@b.com');
    });
  });

  group('RegisterUseCase', () {
    test('يستدعي repo.register', () async {
      final repo = MockAuthRepository();
      repo.returnsOnRegister(const User(id: 'u2', name: 'راشد', email: 'r@test.com'));

      final usecase = RegisterUseCase(repo);
      final result = await usecase('راشد', 'r@test.com', '123456');
      expect(result.email, 'r@test.com');
    });
  });

  group('AwardXpUseCase', () {
    test('يستدعي repo.addXp بالمعاملات الصحيحة', () async {
      final repo = MockAuthRepository();
      repo.returnsOnAddXp(const User(id: 'u1', name: 'م', email: 'm@t.com', xp: 100));

      final usecase = AwardXpUseCase(repo);
      final result = await usecase('u1', 100);
      expect(result.xp, 100);
    });
  });
}
