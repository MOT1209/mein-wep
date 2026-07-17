/// أدوات التحقق من المدخلات.
class Validators {
  Validators._();

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return 'البريد الإلكتروني مطلوب';
    final re = RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');
    if (!re.hasMatch(value.trim())) return 'بريد إلكتروني غير صالح';
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'كلمة المرور مطلوبة';
    if (value.length < 6) return 'كلمة المرور 6 أحرف على الأقل';
    return null;
  }

  static String? required(String? value, {String field = 'هذا الحقل'}) {
    if (value == null || value.trim().isEmpty) return '$field مطلوب';
    return null;
  }

  static String? name(String? value) {
    if (value == null || value.trim().isEmpty) return 'الاسم مطلوب';
    if (value.trim().length < 2) return 'الاسم قصير جداً';
    return null;
  }
}
