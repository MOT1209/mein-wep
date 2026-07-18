import 'package:flutter/material.dart';

import '../../domain/entities/achievement.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/repositories.dart';

/// مزوّد التحفيز: الإنجازات ولوحة المتصدّرين.
class GamificationProvider extends ChangeNotifier {
  GamificationProvider(this._repo);
  final GamificationRepository _repo;

  List<Achievement> achievements = [];
  List<User> leaderboard = [];

  Future<void> load() async {
    achievements = await _repo.achievements();
    leaderboard = await _repo.leaderboard();
    notifyListeners();
  }

  Future<void> refreshLeaderboard() async {
    leaderboard = await _repo.leaderboard();
    notifyListeners();
  }

  /// الإنجازات المفتوحة لمستخدم بناءً على نقاطه.
  List<Achievement> unlockedFor(User user) =>
      achievements.where((a) => user.xp >= a.requiredXp).toList();

  bool isUnlocked(Achievement a, User user) => user.xp >= a.requiredXp;
}
