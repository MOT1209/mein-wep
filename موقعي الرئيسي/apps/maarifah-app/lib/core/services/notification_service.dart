import 'package:flutter/foundation.dart';
import '../../domain/entities/app_notification.dart';

/// خدمة الإشعارات داخل التطبيق (In-App).
///
/// يمكن لاحقاً ربطها بـ flutter_local_notifications / FCM للإشعارات الفورية.
class NotificationService extends ChangeNotifier {
  final List<AppNotification> _items = [];

  List<AppNotification> get items => List.unmodifiable(_items);
  int get unreadCount => _items.where((n) => !n.isRead).length;

  void push(AppNotification n) {
    _items.insert(0, n);
    notifyListeners();
  }

  void markRead(String id) {
    final i = _items.indexWhere((n) => n.id == id);
    if (i != -1) {
      _items[i] = _items[i].copyWith(isRead: true);
      notifyListeners();
    }
  }

  void markAllRead() {
    for (var i = 0; i < _items.length; i++) {
      _items[i] = _items[i].copyWith(isRead: true);
    }
    notifyListeners();
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }

  void seedDemo() {
    if (_items.isNotEmpty) return;
    push(AppNotification(
      id: 'n1',
      title: 'مرحباً بك في معرفة 🎉',
      body: 'ابدأ رحلتك التعليمية واكسب أول 20 نقطة بتسجيل دخولك اليومي.',
      type: NotificationType.system,
      createdAt: DateTime.now(),
    ));
    push(AppNotification(
      id: 'n2',
      title: 'محتوى جديد: مقدمة في الذكاء الاصطناعي',
      body: 'تمت إضافة مقال جديد في قسم الذكاء الاصطناعي.',
      type: NotificationType.content,
      createdAt: DateTime.now().subtract(const Duration(hours: 3)),
    ));
    push(AppNotification(
      id: 'n3',
      title: 'تذكير يومي ⏰',
      body: 'لا تنسَ إكمال درس اليوم للحفاظ على سلسلتك!',
      type: NotificationType.reminder,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ));
  }
}
