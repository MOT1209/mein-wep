import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/core/utils/formatters.dart';

void main() {
  group('Formatters.timeAgo', () {
    test('يعرض "الآن" لأقل من دقيقة', () {
      expect(Formatters.timeAgo(DateTime.now()), 'الآن');
    });

    test('يعرض "منذ X دقيقة"', () {
      final date = DateTime.now().subtract(const Duration(minutes: 5));
      expect(Formatters.timeAgo(date), 'منذ 5 دقيقة');
    });

    test('يعرض "منذ X ساعة"', () {
      final date = DateTime.now().subtract(const Duration(hours: 3));
      expect(Formatters.timeAgo(date), 'منذ 3 ساعة');
    });

    test('يعرض "منذ X يوم"', () {
      final date = DateTime.now().subtract(const Duration(days: 2));
      expect(Formatters.timeAgo(date), 'منذ 2 يوم');
    });

    test('يعرض "منذ X أسبوع"', () {
      final date = DateTime.now().subtract(const Duration(days: 14));
      expect(Formatters.timeAgo(date), 'منذ 2 أسبوع');
    });

    test('يعرض "منذ X شهر"', () {
      final date = DateTime.now().subtract(const Duration(days: 45));
      expect(Formatters.timeAgo(date), 'منذ 1 شهر');
    });

    test('يعرض "منذ X سنة"', () {
      final date = DateTime.now().subtract(const Duration(days: 400));
      expect(Formatters.timeAgo(date), 'منذ 1 سنة');
    });
  });

  group('Formatters.compact', () {
    test('أقل من 1000 يعود كرقم', () {
      expect(Formatters.compact(0), '0');
      expect(Formatters.compact(999), '999');
    });

    test('بالآلاف', () {
      expect(Formatters.compact(1200), '1.2k');
      expect(Formatters.compact(15000), '15.0k');
    });

    test('بالملايين', () {
      expect(Formatters.compact(2500000), '2.5M');
    });
  });

  group('Formatters.duration', () {
    test('أقل من ساعة', () {
      expect(Formatters.duration(15), '15 دقيقة');
    });

    test('ساعة كاملة', () {
      expect(Formatters.duration(60), '1 ساعة');
    });

    test('ساعات ودقائق', () {
      expect(Formatters.duration(90), '1 س 30 د');
      expect(Formatters.duration(150), '2 س 30 د');
    });
  });
}
