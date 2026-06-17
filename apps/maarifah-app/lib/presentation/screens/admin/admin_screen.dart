import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../core/services/notification_service.dart';
import '../../../domain/entities/app_notification.dart';
import '../../../domain/entities/article.dart';
import '../../../domain/entities/course.dart';
import '../../providers/content_provider.dart';
import '../../providers/gamification_provider.dart';

const _uuid = Uuid();

/// لوحة التحكم (للمدير): إدارة المقالات والدورات والإشعارات والمستخدمين.
class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('لوحة التحكم'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'المقالات', icon: Icon(Icons.article)),
              Tab(text: 'الدورات', icon: Icon(Icons.menu_book)),
              Tab(text: 'الإشعارات', icon: Icon(Icons.notifications)),
              Tab(text: 'المستخدمون', icon: Icon(Icons.people)),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _ArticlesAdmin(),
            _CoursesAdmin(),
            _NotificationsAdmin(),
            _UsersAdmin(),
          ],
        ),
      ),
    );
  }
}

// ---------------- المقالات ----------------
class _ArticlesAdmin extends StatelessWidget {
  const _ArticlesAdmin();

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => _edit(context),
        child: const Icon(Icons.add),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: content.articles.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final a = content.articles[i];
          return Card(
            child: ListTile(
              title: Text(a.title),
              subtitle: Text(a.summary, maxLines: 1, overflow: TextOverflow.ellipsis),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(icon: const Icon(Icons.edit, color: AppColors.primary), onPressed: () => _edit(context, a)),
                  IconButton(
                    icon: const Icon(Icons.delete, color: AppColors.error),
                    onPressed: () => context.read<ContentProvider>().removeArticle(a.id),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _edit(BuildContext context, [Article? article]) {
    final title = TextEditingController(text: article?.title ?? '');
    final summary = TextEditingController(text: article?.summary ?? '');
    final body = TextEditingController(text: article?.content ?? '');
    var category = article?.categoryId ?? ContentCategory.general.id;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(left: 16, right: 16, top: 16, bottom: MediaQuery.of(ctx).viewInsets.bottom + 16),
        child: StatefulBuilder(
          builder: (ctx, setSheet) => SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(article == null ? 'إضافة مقال' : 'تعديل مقال',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                TextField(controller: title, decoration: const InputDecoration(labelText: 'العنوان')),
                const SizedBox(height: 8),
                TextField(controller: summary, decoration: const InputDecoration(labelText: 'الملخّص')),
                const SizedBox(height: 8),
                TextField(controller: body, maxLines: 4, decoration: const InputDecoration(labelText: 'المحتوى')),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: category,
                  decoration: const InputDecoration(labelText: 'التصنيف'),
                  items: ContentCategory.values
                      .map((c) => DropdownMenuItem(value: c.id, child: Text(c.ar)))
                      .toList(),
                  onChanged: (v) => setSheet(() => category = v ?? category),
                ),
                const SizedBox(height: 16),
                PrimaryButton(
                  label: 'حفظ',
                  onPressed: () {
                    if (title.text.trim().isEmpty) return;
                    final saved = Article(
                      id: article?.id ?? 'a_${_uuid.v4()}',
                      title: title.text.trim(),
                      summary: summary.text.trim(),
                      content: body.text.trim(),
                      categoryId: category,
                      tags: article?.tags ?? const [],
                    );
                    context.read<ContentProvider>().saveArticle(saved);
                    Navigator.pop(ctx);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------- الدورات ----------------
class _CoursesAdmin extends StatelessWidget {
  const _CoursesAdmin();

  @override
  Widget build(BuildContext context) {
    final content = context.watch<ContentProvider>();
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => _edit(context),
        child: const Icon(Icons.add),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: content.courses.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final c = content.courses[i];
          return Card(
            child: ListTile(
              title: Text(c.title),
              subtitle: Text('${c.lessons.length} درس • ${c.level.ar}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(icon: const Icon(Icons.edit, color: AppColors.primary), onPressed: () => _edit(context, c)),
                  IconButton(
                    icon: const Icon(Icons.delete, color: AppColors.error),
                    onPressed: () => context.read<ContentProvider>().removeCourse(c.id),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _edit(BuildContext context, [Course? course]) {
    final title = TextEditingController(text: course?.title ?? '');
    final desc = TextEditingController(text: course?.description ?? '');
    final instructor = TextEditingController(text: course?.instructor ?? 'فريق معرفة');
    var category = course?.categoryId ?? ContentCategory.programming.id;
    var level = course?.level ?? CourseLevel.beginner;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(left: 16, right: 16, top: 16, bottom: MediaQuery.of(ctx).viewInsets.bottom + 16),
        child: StatefulBuilder(
          builder: (ctx, setSheet) => SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(course == null ? 'إضافة دورة' : 'تعديل دورة',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                TextField(controller: title, decoration: const InputDecoration(labelText: 'العنوان')),
                const SizedBox(height: 8),
                TextField(controller: desc, maxLines: 3, decoration: const InputDecoration(labelText: 'الوصف')),
                const SizedBox(height: 8),
                TextField(controller: instructor, decoration: const InputDecoration(labelText: 'المدرّب')),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: category,
                  decoration: const InputDecoration(labelText: 'التصنيف'),
                  items: ContentCategory.values.map((c) => DropdownMenuItem(value: c.id, child: Text(c.ar))).toList(),
                  onChanged: (v) => setSheet(() => category = v ?? category),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<CourseLevel>(
                  value: level,
                  decoration: const InputDecoration(labelText: 'المستوى'),
                  items: CourseLevel.values.map((l) => DropdownMenuItem(value: l, child: Text(l.ar))).toList(),
                  onChanged: (v) => setSheet(() => level = v ?? level),
                ),
                const SizedBox(height: 16),
                PrimaryButton(
                  label: 'حفظ',
                  onPressed: () {
                    if (title.text.trim().isEmpty) return;
                    final saved = Course(
                      id: course?.id ?? 'c_${_uuid.v4()}',
                      title: title.text.trim(),
                      description: desc.text.trim(),
                      categoryId: category,
                      instructor: instructor.text.trim(),
                      level: level,
                      lessons: course?.lessons ??
                          const [Lesson(id: 'l1', title: 'الدرس الأول', content: 'محتوى تمهيدي')],
                    );
                    context.read<ContentProvider>().saveCourse(saved);
                    Navigator.pop(ctx);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------- الإشعارات ----------------
class _NotificationsAdmin extends StatefulWidget {
  const _NotificationsAdmin();

  @override
  State<_NotificationsAdmin> createState() => _NotificationsAdminState();
}

class _NotificationsAdminState extends State<_NotificationsAdmin> {
  final _title = TextEditingController();
  final _body = TextEditingController();

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('إرسال إشعار جديد', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          TextField(controller: _title, decoration: const InputDecoration(labelText: 'العنوان')),
          const SizedBox(height: 8),
          TextField(controller: _body, maxLines: 3, decoration: const InputDecoration(labelText: 'النص')),
          const SizedBox(height: 16),
          PrimaryButton(
            label: 'إرسال للجميع',
            icon: Icons.send,
            onPressed: () {
              if (_title.text.trim().isEmpty) return;
              context.read<NotificationService>().push(AppNotification(
                    id: _uuid.v4(),
                    title: _title.text.trim(),
                    body: _body.text.trim(),
                    type: NotificationType.content,
                    createdAt: DateTime.now(),
                  ));
              _title.clear();
              _body.clear();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم إرسال الإشعار ✓'), backgroundColor: AppColors.success),
              );
            },
          ),
        ],
      ),
    );
  }
}

// ---------------- المستخدمون ----------------
class _UsersAdmin extends StatelessWidget {
  const _UsersAdmin();

  @override
  Widget build(BuildContext context) {
    final users = context.watch<GamificationProvider>().leaderboard;
    if (users.isEmpty) return const EmptyState(message: 'لا يوجد مستخدمون');
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: users.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (_, i) {
        final u = users[i];
        return Card(
          child: ListTile(
            leading: CircleAvatar(child: Text(u.name.characters.first)),
            title: Text(u.name),
            subtitle: Text('${u.email} • ${u.xp} XP'),
            trailing: Chip(
              label: Text(u.isAdmin ? 'مدير' : 'مستخدم'),
              backgroundColor: (u.isAdmin ? AppColors.secondary : AppColors.primary).withOpacity(0.12),
            ),
          ),
        );
      },
    );
  }
}
