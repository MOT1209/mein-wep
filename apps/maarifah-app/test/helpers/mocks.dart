/// ملف mocks يدوي — يستخدم بدلاً من @GenerateNiceMocks لتجنب الحاجة لـ build_runner.
///
/// على جهاز التطوير، يمكن التبديل إلى @GenerateNiceMocks وتشغيل:
///   dart run build_runner build

import 'package:mockito/mockito.dart';
import 'package:maarifah_app/data/datasources/local_data_source.dart';
import 'package:maarifah_app/data/repositories/repositories_impl.dart';
import 'package:maarifah_app/domain/repositories/repositories.dart';

// ---- Mocks للمستودعات ----
class MockAuthRepository extends Mock implements AuthRepository {}
class MockAuthRepositoryImpl extends Mock implements AuthRepositoryImpl {}
class MockContentRepositoryImpl extends Mock implements ContentRepositoryImpl {}
class MockCommunityRepositoryImpl extends Mock implements CommunityRepositoryImpl {}
class MockFavoritesRepositoryImpl extends Mock implements FavoritesRepositoryImpl {}
class MockGamificationRepositoryImpl extends Mock implements GamificationRepositoryImpl {}

// ---- Mock للـ DataSource ----
class MockLocalDataSource extends Mock implements LocalDataSource {}
