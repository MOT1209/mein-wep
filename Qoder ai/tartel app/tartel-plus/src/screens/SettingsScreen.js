import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateSetting } from '../store/userSlice';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { settings } = useSelector(state => state.user);

  const toggleSetting = (settingName, value) => {
    dispatch(updateSetting({ [settingName]: value }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الإعدادات</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اللغة والعرض</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>اللغة</Text>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>العربية</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>الوضع الليلي</Text>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={(value) => toggleSetting('theme', value ? 'dark' : 'light')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.theme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الصوت والإشعارات</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>تشغيل صوت الشيخ تلقائياً</Text>
          <Switch
            value={settings.autoPlaySheikh}
            onValueChange={(value) => toggleSetting('autoPlaySheikh', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.autoPlaySheikh ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>الإشعارات</Text>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => toggleSetting('notifications', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.notifications ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>مستوى التصحيح</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>حساسية التصحيح</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity 
              style={[
                styles.levelButton, 
                settings.correctionSensitivity === 'low' && styles.activeLevel
              ]}
              onPress={() => toggleSetting('correctionSensitivity', 'low')}
            >
              <Text style={[
                styles.levelText,
                settings.correctionSensitivity === 'low' && styles.activeLevelText
              ]}>منخفض</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.levelButton, 
                settings.correctionSensitivity === 'medium' && styles.activeLevel
              ]}
              onPress={() => toggleSetting('correctionSensitivity', 'medium')}
            >
              <Text style={[
                styles.levelText,
                settings.correctionSensitivity === 'medium' && styles.activeLevelText
              ]}>متوسط</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.levelButton, 
                settings.correctionSensitivity === 'high' && styles.activeLevel
              ]}
              onPress={() => toggleSetting('correctionSensitivity', 'high')}
            >
              <Text style={[
                styles.levelText,
                settings.correctionSensitivity === 'high' && styles.activeLevelText
              ]}>مرتفع</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الحساب</Text>
        
        <TouchableOpacity style={styles.accountButton}>
          <Text style={styles.accountButtonText}>تعديل الملف الشخصي</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.accountButton}>
          <Text style={styles.accountButtonText}>سجل النشاط</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  languageButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  languageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  levelButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  levelText: {
    color: '#666',
    fontSize: 14,
  },
  activeLevel: {
    backgroundColor: '#1976D2',
  },
  activeLevelText: {
    color: '#fff',
  },
  accountButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  accountButtonText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SettingsScreen;