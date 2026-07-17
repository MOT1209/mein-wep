import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ProgressScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>تقدمك في التعلم</Text>
      
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>الإحصائيات العامة</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>الآيات المحفوظة:</Text>
          <Text style={styles.statValue}>25 آية</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>جلسات التلاوة:</Text>
          <Text style={styles.statValue}>42 جلسة</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>أيام التعلم:</Text>
          <Text style={styles.statValue}>15 يوم</Text>
        </View>
      </View>
      
      <View style={styles.achievementsCard}>
        <Text style={styles.cardTitle}>الإنجازات</Text>
        <View style={styles.achievementItem}>
          <Text style={styles.achievementText}>🏆 حافظت على 10 آيات</Text>
        </View>
        <View style={styles.achievementItem}>
          <Text style={styles.achievementText}>⭐ تمت 5 جلسات متتالية</Text>
        </View>
        <View style={styles.achievementItem}>
          <Text style={styles.achievementText}>🎯 دقة 90% في التصحيح</Text>
        </View>
      </View>
      
      <View style={styles.goalsCard}>
        <Text style={styles.cardTitle}>الأهداف القادمة</Text>
        <Text style={styles.goalText}>• حفظ 5 آيات جديدة هذا الأسبوع</Text>
        <Text style={styles.goalText}>• تحسين الدقة إلى 95%</Text>
        <Text style={styles.goalText}>• إكمال سورة البقرة</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976D2',
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  achievementsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  achievementItem: {
    paddingVertical: 8,
  },
  achievementText: {
    fontSize: 16,
    color: '#333',
  },
  goalsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  goalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});

export default ProgressScreen;