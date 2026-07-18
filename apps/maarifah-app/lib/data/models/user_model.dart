import '../../core/constants/app_constants.dart';
import '../../domain/entities/user.dart';

/// نموذج المستخدم — يضيف تحويل JSON لكيان [User] (لطبقة البيانات).
class UserModel extends User {
  const UserModel({
    required super.id,
    required super.name,
    required super.email,
    super.avatarUrl,
    super.bio,
    super.role,
    super.xp,
    super.streak,
    super.followers,
    super.following,
    super.interests,
    super.unlockedAchievements,
    super.completedCourses,
  });

  /// كلمة المرور تُخزّن منفصلة عن الكيان (لا تُسرّب لطبقة العرض).
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      bio: (json['bio'] as String?) ?? '',
      role: (json['role'] as String?) == 'admin' ? UserRole.admin : UserRole.user,
      xp: (json['xp'] as num?)?.toInt() ?? 0,
      streak: (json['streak'] as num?)?.toInt() ?? 0,
      followers: _list(json['followers']),
      following: _list(json['following']),
      interests: _list(json['interests']),
      unlockedAchievements: _list(json['unlockedAchievements']),
      completedCourses: _list(json['completedCourses']),
    );
  }

  factory UserModel.fromEntity(User u) => UserModel(
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        role: u.role,
        xp: u.xp,
        streak: u.streak,
        followers: u.followers,
        following: u.following,
        interests: u.interests,
        unlockedAchievements: u.unlockedAchievements,
        completedCourses: u.completedCourses,
      );

  Map<String, dynamic> toJson({String? password}) => {
        'id': id,
        'name': name,
        'email': email,
        'avatarUrl': avatarUrl,
        'bio': bio,
        'role': role == UserRole.admin ? 'admin' : 'user',
        'xp': xp,
        'streak': streak,
        'followers': followers,
        'following': following,
        'interests': interests,
        'unlockedAchievements': unlockedAchievements,
        'completedCourses': completedCourses,
        if (password != null) 'password': password,
      };

  static List<String> _list(dynamic v) =>
      v == null ? const [] : (v as List<dynamic>).cast<String>();
}
