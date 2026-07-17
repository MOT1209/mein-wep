import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../domain/entities/community.dart';
import '../../providers/auth_provider.dart';
import '../../providers/community_provider.dart';

/// تبويب المجتمع: المنشورات والتفاعل.
class CommunityScreen extends StatelessWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final community = context.watch<CommunityProvider>();
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(title: const Text('المجتمع')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreatePost(context),
        icon: const Icon(Icons.edit),
        label: const Text('منشور جديد'),
      ),
      body: community.loading
          ? const Center(child: CircularProgressIndicator())
          : community.posts.isEmpty
              ? const EmptyState(message: 'كن أول من ينشر!')
              : RefreshIndicator(
                  onRefresh: () => context.read<CommunityProvider>().load(),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: community.posts.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) => _PostCard(post: community.posts[i], currentUserId: user?.id ?? ''),
                  ),
                ),
    );
  }

  void _showCreatePost(BuildContext context) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 16, right: 16, top: 16,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('منشور جديد', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              maxLines: 4,
              decoration: const InputDecoration(hintText: 'ماذا يدور في ذهنك؟'),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'نشر',
              onPressed: () {
                final user = context.read<AuthProvider>().user;
                if (user != null && controller.text.trim().isNotEmpty) {
                  context.read<CommunityProvider>().createPost(user, controller.text.trim());
                }
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard({required this.post, required this.currentUserId});
  final Post post;
  final String currentUserId;

  @override
  Widget build(BuildContext context) {
    final liked = post.isLikedBy(currentUserId);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(child: Text(post.authorName.characters.first)),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(post.authorName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text(Formatters.timeAgo(post.createdAt),
                        style: const TextStyle(fontSize: 12, color: AppColors.lightTextSecondary)),
                  ],
                ),
                const Spacer(),
                CategoryChip(label: post.tag, color: AppColors.primary),
              ],
            ),
            const SizedBox(height: 12),
            Text(post.text, style: const TextStyle(height: 1.6)),
            const Divider(height: 24),
            Row(
              children: [
                InkWell(
                  onTap: () => context.read<CommunityProvider>().toggleLike(post.id, currentUserId),
                  child: Row(
                    children: [
                      Icon(liked ? Icons.favorite : Icons.favorite_border,
                          color: liked ? AppColors.error : AppColors.lightTextSecondary, size: 20),
                      const SizedBox(width: 4),
                      Text('${post.likes}'),
                    ],
                  ),
                ),
                const SizedBox(width: 20),
                InkWell(
                  onTap: () => _showComments(context),
                  child: Row(
                    children: [
                      const Icon(Icons.mode_comment_outlined, size: 20, color: AppColors.lightTextSecondary),
                      const SizedBox(width: 4),
                      Text('${post.comments.length}'),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showComments(BuildContext context) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheet) {
            final community = ctx.watch<CommunityProvider>();
            final current = community.posts.firstWhere((p) => p.id == post.id, orElse: () => post);
            return Padding(
              padding: EdgeInsets.only(
                left: 16, right: 16, top: 16,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('التعليقات', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (current.comments.isEmpty)
                    const Padding(padding: EdgeInsets.all(16), child: Text('لا توجد تعليقات بعد')),
                  ...current.comments.map((c) => ListTile(
                        leading: CircleAvatar(child: Text(c.authorName.characters.first)),
                        title: Text(c.authorName, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(c.text),
                      )),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: controller,
                          decoration: const InputDecoration(hintText: 'أضف تعليقاً...'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        icon: const Icon(Icons.send),
                        onPressed: () {
                          final user = ctx.read<AuthProvider>().user;
                          if (user != null && controller.text.trim().isNotEmpty) {
                            ctx.read<CommunityProvider>().addComment(post.id, user, controller.text.trim());
                            controller.clear();
                            setSheet(() {});
                          }
                        },
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
