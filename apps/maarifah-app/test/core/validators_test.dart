import 'package:flutter_test/flutter_test.dart';
import 'package:maarifah_app/core/utils/validators.dart';

void main() {
  group('Validators.email', () {
    test('يقبل بريداً صحيحاً', () {
      expect(Validators.email('user@example.com'), isNull);
      expect(Validators.email('r@c.io'), isNull);
      expect(Validators.email('a.b+c@d-e.f'), isNull);
    });

    test('يرفض فارغاً', () {
      expect(Validators.email(null), isNotNull);
      expect(Validators.email(''), isNotNull);
      expect(Validators.email('   '), isNotNull);
    });

    test('يرفض صيغة خاطئة', () {
      expect(Validators.email('not-email'), isNotNull);
      expect(Validators.email('@domain.com'), isNotNull);
      expect(Validators.email('user@'), isNotNull);
      expect(Validators.email('user@.com'), isNotNull);
    });
  });

  group('Validators.password', () {
    test('يقبل 6 أحرف فأكثر', () {
      expect(Validators.password('123456'), isNull);
      expect(Validators.password('abcdefgh'), isNull);
    });

    test('يرفض فارغاً أو أقل من 6', () {
      expect(Validators.password(null), isNotNull);
      expect(Validators.password(''), isNotNull);
      expect(Validators.password('ab'), isNotNull);
      expect(Validators.password('12345'), isNotNull);
    });
  });

  group('Validators.name', () {
    test('يقبل اسم صحيح', () {
      expect(Validators.name('راشد'), isNull);
      expect(Validators.name('محمد أحمد'), isNull);
    });

    test('يرفض فارغاً أو قصيراً', () {
      expect(Validators.name(null), isNotNull);
      expect(Validators.name(''), isNotNull);
      expect(Validators.name('أ'), isNotNull); // shorter than 2 chars
    });
  });

  group('Validators.required', () {
    test('يرفض null أو فارغ', () {
      expect(Validators.required(null), isNotNull);
      expect(Validators.required(''), isNotNull);
      expect(Validators.required('  '), isNotNull);
    });

    test('يقبل قيمة', () {
      expect(Validators.required('نص'), isNull);
    });

    test('يستخدم اسم الحقل المخصص', () {
      final err = Validators.required(null, field: 'الاسم');
      expect(err, contains('الاسم'));
    });
  });
}
