import 'package:flutter/material.dart';

/// لوحة ألوان التطبيق (نهاري/ليلي).
class AppColors {
  AppColors._();

  // الأساسية
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryDark = Color(0xFF1E40AF);
  static const Color secondary = Color(0xFF7C3AED);
  static const Color accent = Color(0xFF06B6D4);

  // الحالة
  static const Color success = Color(0xFF16A34A);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFDC2626);
  static const Color info = Color(0xFF0EA5E9);

  // الوضع النهاري
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightText = Color(0xFF0F172A);
  static const Color lightTextSecondary = Color(0xFF64748B);
  static const Color lightBorder = Color(0xFFE2E8F0);

  // الوضع الليلي
  static const Color darkBackground = Color(0xFF0B1120);
  static const Color darkSurface = Color(0xFF111827);
  static const Color darkCard = Color(0xFF1E293B);
  static const Color darkText = Color(0xFFF1F5F9);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkBorder = Color(0xFF334155);

  // تصنيفات
  static const Color catGeneral = Color(0xFF0EA5E9);
  static const Color catProgramming = Color(0xFF22C55E);
  static const Color catAi = Color(0xFFA855F7);
  static const Color catCourses = Color(0xFFF59E0B);

  static const List<Color> primaryGradient = [primary, secondary];
}
