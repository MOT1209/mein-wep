import 'package:flutter/material.dart';

import '../../domain/entities/user.dart';
import '../../domain/repositories/repositories.dart';
import '../../domain/usecases/usecases.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

/// مزوّد المصادقة وحالة المستخدم الحالي.
class AuthProvider extends ChangeNotifier {
  AuthProvider(this._repo)
      : _login = LoginUseCase(_repo),
        _register = RegisterUseCase(_repo),
        _awardXp = AwardXpUseCase(_repo);

  final AuthRepository _repo;
  final LoginUseCase _login;
  final RegisterUseCase _register;
  final AwardXpUseCase _awardXp;

  AuthStatus status = AuthStatus.unknown;
  User? user;
  bool loading = false;
  String? error;

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isAdmin => user?.isAdmin ?? false;

  Future<void> bootstrap() async {
    user = await _repo.currentUser();
    status = user == null ? AuthStatus.unauthenticated : AuthStatus.authenticated;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    return _run(() => _login(email, password));
  }

  Future<bool> register(String name, String email, String password) async {
    return _run(() => _register(name, email, password));
  }

  Future<void> logout() async {
    await _repo.logout();
    user = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  Future<void> updateProfile(User updated) async {
    user = await _repo.updateProfile(updated);
    notifyListeners();
  }

  /// منح نقاط XP وتحديث المستخدم الحالي.
  Future<int> awardXp(int amount) async {
    if (user == null) return 0;
    final before = user!.level;
    user = await _awardXp(user!.id, amount);
    notifyListeners();
    return user!.level - before; // عدد المستويات الجديدة
  }

  Future<bool> _run(Future<User> Function() action) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      user = await action();
      status = AuthStatus.authenticated;
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
