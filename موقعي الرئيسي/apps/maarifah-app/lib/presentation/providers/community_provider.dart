import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import '../../domain/entities/community.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/repositories.dart';

const _uuid = Uuid();

/// مزوّد المجتمع: المنشورات، الإعجابات، التعليقات، الرسائل.
class CommunityProvider extends ChangeNotifier {
  CommunityProvider(this._repo);
  final CommunityRepository _repo;

  List<Post> posts = [];
  bool loading = false;

  Future<void> load() async {
    loading = true;
    notifyListeners();
    posts = await _repo.posts();
    loading = false;
    notifyListeners();
  }

  Future<void> createPost(User author, String text, {String tag = 'عام'}) async {
    final post = Post(
      id: _uuid.v4(),
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatarUrl,
      text: text,
      tag: tag,
      createdAt: DateTime.now(),
    );
    await _repo.addPost(post);
    posts = await _repo.posts();
    notifyListeners();
  }

  Future<void> toggleLike(String postId, String userId) async {
    final updated = await _repo.toggleLike(postId, userId);
    _replace(updated);
  }

  Future<void> addComment(String postId, User author, String text) async {
    final comment = Comment(
      id: _uuid.v4(),
      postId: postId,
      authorName: author.name,
      authorAvatar: author.avatarUrl,
      text: text,
      createdAt: DateTime.now(),
    );
    final updated = await _repo.addComment(postId, comment);
    _replace(updated);
  }

  Future<List<Message>> chat(String peerId) => _repo.messages(peerId);

  Future<void> send(String peerId, User me, String text) async {
    final msg = Message(
      id: _uuid.v4(),
      senderId: me.id,
      text: text,
      createdAt: DateTime.now(),
      isMe: true,
    );
    await _repo.sendMessage(peerId, msg);
  }

  void _replace(Post updated) {
    final i = posts.indexWhere((p) => p.id == updated.id);
    if (i != -1) {
      posts[i] = updated;
      notifyListeners();
    }
  }
}
