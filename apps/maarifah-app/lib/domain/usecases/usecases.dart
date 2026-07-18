import '../entities/quiz.dart';
import '../entities/user.dart';
import '../repositories/repositories.dart';
import '../../core/constants/app_constants.dart';

/// حالة استخدام: تسجيل الدخول.
class LoginUseCase {
  const LoginUseCase(this._repo);
  final AuthRepository _repo;
  Future<User> call(String email, String password) => _repo.login(email, password);
}

/// حالة استخدام: التسجيل.
class RegisterUseCase {
  const RegisterUseCase(this._repo);
  final AuthRepository _repo;
  Future<User> call(String name, String email, String password) =>
      _repo.register(name, email, password);
}

/// حالة استخدام: منح نقاط XP عند إنجاز.
class AwardXpUseCase {
  const AwardXpUseCase(this._repo);
  final AuthRepository _repo;
  Future<User> call(String userId, int amount) => _repo.addXp(userId, amount);
}

/// حالة استخدام: تقييم اختبار وحساب النتيجة.
class EvaluateQuizUseCase {
  const EvaluateQuizUseCase();

  QuizResult call(Quiz quiz, List<int> answers) {
    var correct = 0;
    for (var i = 0; i < quiz.questions.length; i++) {
      final a = i < answers.length ? answers[i] : -1;
      if (quiz.questions[i].isCorrect(a)) correct++;
    }
    return QuizResult(
      quiz: quiz,
      correctCount: correct,
      total: quiz.questions.length,
      answers: answers,
    );
  }

  int xpReward(QuizResult result) => result.passed ? AppConstants.xpPerQuizPass : 0;
}
