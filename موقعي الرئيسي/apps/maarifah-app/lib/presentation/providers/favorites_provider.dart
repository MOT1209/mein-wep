import 'package:flutter/material.dart';

import '../../domain/repositories/repositories.dart';

/// مزوّد المفضلة.
class FavoritesProvider extends ChangeNotifier {
  FavoritesProvider(this._repo);
  final FavoritesRepository _repo;

  Set<String> _ids = {};
  String? _userId;

  Set<String> get ids => _ids;
  bool isFavorite(String articleId) => _ids.contains(articleId);

  Future<void> load(String userId) async {
    _userId = userId;
    _ids = await _repo.favorites(userId);
    notifyListeners();
  }

  Future<void> toggle(String articleId) async {
    if (_userId == null) return;
    await _repo.toggle(_userId!, articleId);
    _ids = await _repo.favorites(_userId!);
    notifyListeners();
  }

  void clear() {
    _ids = {};
    _userId = null;
    notifyListeners();
  }
}
