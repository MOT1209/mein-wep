import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/content_provider.dart';
import '../../providers/gamification_provider.dart';

/// شاشة الإحصائيات وتقييم الأداء.
class StatisticsScreen extends StatelessWidget {
  const StatisticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user!;
    final content = context.watch<ContentProvider>();
    final game = context.watch<GamificationProvider>();
    final unlocked = game.unlockedFor(user).length;

    // بيانات نشاط أسبوعي تمثيلية مبنية على نقاط المستخدم.
    final weekly = [3, 5, 2, 6, 4, 7, user.streak.clamp(1, 8)];

    return Scaffold(
      appBar: AppBar(title: const Text('الإحصائيات')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.4,
            children: [
              _StatCard(icon: Icons.bolt, label: 'إجمالي النقاط', value: '${user.xp}', color: AppColors.primary),
              _StatCard(icon: Icons.trending_up, label: 'المستوى', value: '${user.level}', color: AppColors.secondary),
              _StatCard(icon: Icons.local_fire_department, label: 'أيام متتالية', value: '${user.streak}', color: AppColors.warning),
              _StatCard(icon: Icons.military_tech, label: 'الإنجازات', value: '$unlocked', color: AppColors.success),
              _StatCard(icon: Icons.menu_book, label: 'الدورات', value: '${content.courses.length}', color: AppColors.info),
              _StatCard(icon: Icons.quiz, label: 'الاختبارات', value: '${content.quizzes.length}', color: AppColors.catAi),
            ],
          ),
          const SizedBox(height: 20),
          const Text('النشاط الأسبوعي', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 8,
                borderData: FlBorderData(show: false),
                gridData: const FlGridData(show: false),
                titlesData: FlTitlesData(
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, _) {
                        const days = ['سبت', 'أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع'];
                        final i = value.toInt();
                        return Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(i >= 0 && i < days.length ? days[i] : '',
                              style: const TextStyle(fontSize: 11)),
                        );
                      },
                    ),
                  ),
                ),
                barGroups: List.generate(
                  weekly.length,
                  (i) => BarChartGroupData(x: i, barRods: [
                    BarChartRodData(
                      toY: weekly[i].toDouble(),
                      width: 16,
                      borderRadius: BorderRadius.circular(6),
                      gradient: const LinearGradient(
                        colors: AppColors.primaryGradient,
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                      ),
                    ),
                  ]),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.icon, required this.label, required this.value, required this.color});
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.lightTextSecondary)),
        ],
      ),
    );
  }
}
