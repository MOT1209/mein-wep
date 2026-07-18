import 'package:equatable/equatable.dart';

/// درس داخل دورة.
class Lesson extends Equatable {
  const Lesson({
    required this.id,
    required this.title,
    required this.content,
    this.durationMinutes = 10,
    this.videoUrl,
  });

  final String id;
  final String title;
  final String content;
  final int durationMinutes;
  final String? videoUrl;

  @override
  List<Object?> get props => [id];
}

/// مستوى الدورة.
enum CourseLevel {
  beginner('مبتدئ'),
  intermediate('متوسط'),
  advanced('متقدم');

  const CourseLevel(this.ar);
  final String ar;
}

/// كيان الدورة التعليمية.
class Course extends Equatable {
  const Course({
    required this.id,
    required this.title,
    required this.description,
    required this.categoryId,
    required this.lessons,
    this.imageUrl,
    this.instructor = 'فريق معرفة',
    this.level = CourseLevel.beginner,
    this.rating = 4.5,
    this.studentsCount = 0,
    this.hasCertificate = true,
  });

  final String id;
  final String title;
  final String description;
  final String categoryId;
  final List<Lesson> lessons;
  final String? imageUrl;
  final String instructor;
  final CourseLevel level;
  final double rating;
  final int studentsCount;
  final bool hasCertificate;

  int get totalMinutes => lessons.fold(0, (s, l) => s + l.durationMinutes);

  @override
  List<Object?> get props => [id];
}
