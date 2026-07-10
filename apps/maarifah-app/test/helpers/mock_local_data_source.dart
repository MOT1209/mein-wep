import 'package:maarifah_app/data/datasources/local_data_source.dart';
import 'package:maarifah_app/data/models/user_model.dart';

/// Mock خاص بـ LocalDataSource — بطرقها الفعلية.
class MockDataStore {
  Map<String, String> _store = {};
  int _insertCalls = 0;
  int _updateCalls = 0;
  int _setCurrentUserIdCalls = 0;

  void clear() {
    _store = {};
    _insertCalls = 0;
    _updateCalls = 0;
    _setCurrentUserIdCalls = 0;
  }

  // user_<id> -> json
  // user_email_<email> -> id
  // current_user_id -> userId
  // user_favorites_<userId> -> json list

  void seedUser(Map<String, dynamic> user) {
    final id = user['id'] as String;
    _store['user_$id'] = user.toString();
    _store['user_email_${user['email']}'] = id;
  }

  String? getItem(String key) => _store[key];
  void setItem(String key, String value) => _store[key] = value;

  int get insertCalls => _insertCalls;
  int get updateCalls => _updateCalls;
  int get setCurrentUserIdCalls => _setCurrentUserIdCalls;

  void recordInsert() => _insertCalls++;
  void recordUpdate() => _updateCalls++;
  void recordSetCurrentUserId() => _setCurrentUserIdCalls++;
}
