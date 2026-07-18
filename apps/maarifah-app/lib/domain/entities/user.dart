import 'package:equatable/equatable.dart';
import '../../core/constants/app_constants.dart';

/// كيان المستخدم.
class User extends Equatable {
  const User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.bio = '',
    this.role = UserRole.user,
    this.xp = 0,
    this.streak = 0,
    this.followers = const [],
    this.following = const [],
    this.interests = const [],
    this.unlockedAchievements = const [],
    this.completedCourses = const [],
  });

  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final String bio;
  final UserRole role;
  final int xp;
  final int streak;
  final List<String> followers;
  final List<String> following;
  final List<String> interests;
  final List<String> unlockedAchievements;
  final List<String> completedCourses;

  int get level => (xp ~/ AppConstants.xpPerLevel) + 1;
  int get xpInLevel => xp % AppConstants.xpPerLevel;
  double get levelProgress => xpInLevel / AppConstants.xpPerLevel;
  bool get isAdmin => role == UserRole.admin;

  User copyWith({
    String? name,
    String? email,
    String? avatarUrl,
    String? bio,
    UserRole? role,
    int? xp,
    int? streak,
    List<String>? followers,
    List<String>? following,
    List<String>? interests,
    List<String>? unlockedAchievements,
    List<String>? completedCourses,
  }) {
    return User(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      role: role ?? this.role,
      xp: xp ?? this.xp,
      streak: streak ?? this.streak,
      followers: followers ?? this.followers,
      following: following ?? this.following,
      interests: interests ?? this.interests,
      unlockedAchievements: unlockedAchievements ?? this.unlockedAchievements,
      completedCourses: completedCourses ?? this.completedCourses,
    );
  }

  @override
  List<Object?> get props => [id, name, email, xp, streak, role];
}
