import 'package:equatable/equatable.dart';

/// تعليق على منشور.
class Comment extends Equatable {
  const Comment({
    required this.id,
    required this.postId,
    required this.authorName,
    required this.text,
    required this.createdAt,
    this.authorAvatar,
  });

  final String id;
  final String postId;
  final String authorName;
  final String? authorAvatar;
  final String text;
  final DateTime createdAt;

  @override
  List<Object?> get props => [id];
}

/// منشور في المجتمع.
class Post extends Equatable {
  const Post({
    required this.id,
    required this.authorId,
    required this.authorName,
    required this.text,
    required this.createdAt,
    this.authorAvatar,
    this.likedBy = const [],
    this.comments = const [],
    this.tag = 'عام',
  });

  final String id;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final String text;
  final DateTime createdAt;
  final List<String> likedBy;
  final List<Comment> comments;
  final String tag;

  int get likes => likedBy.length;
  bool isLikedBy(String userId) => likedBy.contains(userId);

  Post copyWith({List<String>? likedBy, List<Comment>? comments}) => Post(
        id: id,
        authorId: authorId,
        authorName: authorName,
        authorAvatar: authorAvatar,
        text: text,
        createdAt: createdAt,
        likedBy: likedBy ?? this.likedBy,
        comments: comments ?? this.comments,
        tag: tag,
      );

  @override
  List<Object?> get props => [id, likedBy, comments];
}

/// رسالة محادثة مباشرة.
class Message extends Equatable {
  const Message({
    required this.id,
    required this.senderId,
    required this.text,
    required this.createdAt,
    this.isMe = false,
  });

  final String id;
  final String senderId;
  final String text;
  final DateTime createdAt;
  final bool isMe;

  @override
  List<Object?> get props => [id];
}
