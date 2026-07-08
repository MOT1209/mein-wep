import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/domain/entities/achievement.dart';
import 'package:maarifah_app/domain/entities/app_notification.dart';
import 'package:maarifah_app/domain/entities/article.dart';
import 'package:maarifah_app/domain/entities/community.dart';
import 'package:maarifah_app/domain/entities/course.dart';
import 'package:maarifah_app/domain/entities/quiz.dart';
import 'package:maarifah_app/domain/entities/user.dart';
import 'package:flutter/material.dart';

void main() {
  // ─── Course & Lesson ───────────────────────────────────────────
  group('Lesson', () {
    test('ينشئ درساً بالحقول المطلوبة', () {
      const lesson = Lesson(
        id: 'l1',
        title: 'مقدمة في الذكاء الاصطناعي',
        content: 'محتوى الدرس',
      );
      expect(lesson.id, 'l1');
      expect(lesson.title, 'مقدمة في الذكاء الاصطناعي');
      expect(lesson.durationMinutes, 10); // default
      expect(lesson.videoUrl, isNull);
    });

    test('Equality يعتمد على id', () {
      const a = Lesson(id: 'l1', title: 'أ', content: '...');
      const b = Lesson(id: 'l1', title: 'ب', content: '...'); // different title
      expect(a, b); // same id → equal
    });
  });

  group('Course', () {
    test('ينشئ دورة ويحسب totalMinutes', () {
      const course = Course(
        id: 'c1',
        title: 'دورة AI',
        description: 'شرح',
        categoryId: 'ai',
        lessons: [
          Lesson(id: 'l1', title: 'درس 1', content: '', durationMinutes: 15),
          Lesson(id: 'l2', title: 'درس 2', content: '', durationMinutes: 25),
        ],
      );
      expect(course.totalMinutes, 40);
      expect(course.level, CourseLevel.beginner); // default
    });

    test('Equality يعتمد على id', () {
      const a = Course(id: 'c1', title: 'أ', description: '', categoryId: 'ai', lessons: []);
      const b = Course(id: 'c1', title: 'ب', description: '', categoryId: 'ai', lessons: []);
      expect(a, b);
    });
  });

  // ─── Article ───────────────────────────────────────────────────
  group('Article', () {
    test('ينشئ مقالاً مع createdAt افتراضي', () {
      final article = Article(
        id: 'a1',
        title: 'عنوان',
        summary: 'ملخص',
        content: 'محتوى',
        categoryId: 'general',
      );
      expect(article.id, 'a1');
      expect(article.createdAt, DateTime(2024, 1, 1)); // epoch default
      expect(article.views, 0);
      expect(article.likes, 0);
    });

    test('copyWith يحدث views و likes', () {
      final article = Article(
        id: 'a1', title: 'عنوان', summary: '', content: '', categoryId: 'general',
      );
      final updated = article.copyWith(views: 10, likes: 5);
      expect(updated.views, 10);
      expect(updated.likes, 5);
      expect(updated.id, article.id); // باقي الحقول unchanged
    });
  });

  // ─── User ──────────────────────────────────────────────────────
  group('User', () {
    test('ينشئ مستخدمًا بالقيم الافتراضية', () {
      const user = User(id: 'u1', name: 'راشد', email: 'r@example.com');
      expect(user.role, UserRole.user);
      expect(user.xp, 0);
      expect(user.level, 1); // xp ~/ 500 + 1
    });

    test('level يحسب بشكل صحيح', () {
      const user = User(id: 'u1', name: 'راشد', email: 'r@example.com', xp: 1250);
      expect(user.level, 3); // 1250 ~/ 500 + 1 = 3
      expect(user.xpInLevel, 250); // 1250 % 500
      expect(user.levelProgress, closeTo(0.5, 0.01));
    });

    test('isAdmin يعود true عند role.admin', () {
      const admin = User(id: 'u2', name: 'مدير', email: 'admin@test.com', role: UserRole.admin);
      expect(admin.isAdmin, isTrue);
    });

    test('copyWith يحدث الحقول', () {
      const user = User(id: 'u1', name: 'راشد', email: 'r@example.com');
      final updated = user.copyWith(name: 'راشد الجديد', xp: 500);
      expect(updated.name, 'راشد الجديد');
      expect(updated.xp, 500);
      expect(updated.email, 'r@example.com'); // unchanged
    });
  });

  // ─── Quiz & Question ───────────────────────────────────────────
  group('Question', () {
    test('isCorrect يتحقق من الإجابة', () {
      const q = Question(id: 'q1', text: 'ما لون السماء؟', options: ['أحمر', 'أزرق'], correctIndex: 1);
      expect(q.isCorrect(1), isTrue);
      expect(q.isCorrect(0), isFalse);
    });
  });

  group('QuizResult', () {
    test('scorePercent و passed يحسبان بشكل صحيح', () {
      const quiz = Quiz(
        id: 'qz1', title: 'اختبار', categoryId: 'ai', passScore: 60,
        questions: [
          Question(id: '1', text: 'a', options: ['x', 'y'], correctIndex: 0),
          Question(id: '2', text: 'b', options: ['x', 'y'], correctIndex: 1),
          Question(id: '3', text: 'c', options: ['x', 'y'], correctIndex: 0),
        ],
      );
      const result = QuizResult(quiz: quiz, correctCount: 2, total: 3, answers: [0, 1, 1]);
      expect(result.scorePercent, 67); // ~66.6 → round 67
      expect(result.passed, isTrue);
    });

    test('يرسب إذا كانت النسبة أقل من passScore', () {
      const quiz = Quiz(
        id: 'qz1', title: 'اختبار', categoryId: 'ai', passScore: 50,
        questions: [
          Question(id: '1', text: 'a', options: ['x', 'y'], correctIndex: 0),
          Question(id: '2', text: 'b', options: ['x', 'y'], correctIndex: 1),
        ],
      );
      const result = QuizResult(quiz: quiz, correctCount: 0, total: 2, answers: [1, 0]);
      expect(result.passed, isFalse);
    });
  });

  // ─── Achievement ───────────────────────────────────────────────
  group('Achievement', () {
    test('ينشئ إنجازاً', () {
      const achievement = Achievement(
        id: 'ach1',
        title: 'نشيط',
        description: 'أنهيت 5 دروس',
        icon: Icons.star,
        color: Colors.amber,
        requiredXp: 250,
      );
      expect(achievement.id, 'ach1');
      expect(achievement.requiredXp, 250);
    });
  });

  // ─── Notification ──────────────────────────────────────────────
  group('AppNotification', () {
    test('copyWith يحدث isRead', () {
      final now = DateTime.now();
      const type = NotificationType.system;
      final notif = AppNotification(id: 'n1', title: 'مرحباً', body: 'نص', type: type, createdAt: now);
      final read = notif.copyWith(isRead: true);
      expect(read.isRead, isTrue);
      expect(read.id, 'n1');
    });
  });

  // ─── Community ─────────────────────────────────────────────────
  group('Post', () {
    test('likes و isLikedBy يعملان', () {
      final now = DateTime.now();
      final post = Post(
        id: 'p1', authorId: 'u1', authorName: 'راشد', text: 'منشور', createdAt: now,
        likedBy: ['user_a', 'user_b'],
      );
      expect(post.likes, 2);
      expect(post.isLikedBy('user_a'), isTrue);
      expect(post.isLikedBy('unknown'), isFalse);
    });

    test('copyWith يحدث likedBy', () {
      final now = DateTime.now();
      final post = Post(id: 'p1', authorId: 'u1', authorName: 'ر', text: 'ن', createdAt: now);
      final liked = post.copyWith(likedBy: ['u2']);
      expect(liked.likedBy, ['u2']);
      expect(liked.text, 'ن'); // unchanged
    });
  });

  group('Message', () {
    test('isMe افتراضي false', () {
      final msg = Message(id: 'm1', senderId: 'u1', text: 'سلام', createdAt: DateTime.now());
      expect(msg.isMe, isFalse);
    });
  });
}
