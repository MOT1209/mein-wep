import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

/// كيان الإنجاز / الشارة.
class Achievement extends Equatable {
  const Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.requiredXp,
  });

  final String id;
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final int requiredXp;

  @override
  List<Object?> get props => [id];
}
