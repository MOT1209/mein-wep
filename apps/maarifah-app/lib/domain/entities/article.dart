import 'package:equatable/equatable.dart';

/// كيان المقال/المحتوى المعرفي.
class Article extends Equatable {
  Article({
    required this.id,
    required this.title,
    required this.summary,
    required this.content,
    required this.categoryId,
    this.imageUrl,
    this.author = 'فريق معرفة',
    this.tags = const [],
    this.readMinutes = 4,
    this.views = 0,
    this.likes = 0,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? _epoch;

  static final DateTime _epoch = DateTime(2024, 1, 1);

  final String id;
  final String title;
  final String summary;
  final String content;
  final String categoryId;
  final String? imageUrl;
  final String author;
  final List<String> tags;
  final int readMinutes;
  final int views;
  final int likes;
  final DateTime createdAt;

  Article copyWith({int? views, int? likes}) => Article(
        id: id,
        title: title,
        summary: summary,
        content: content,
        categoryId: categoryId,
        imageUrl: imageUrl,
        author: author,
        tags: tags,
        readMinutes: readMinutes,
        views: views ?? this.views,
        likes: likes ?? this.likes,
        createdAt: createdAt,
      );

  @override
  List<Object?> get props => [id];
}
