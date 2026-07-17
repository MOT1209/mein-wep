import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AudioService from '../services/AudioService';

const RecitationScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);

  useEffect(() => {
    AudioService.initializeAudio();
    return () => {
      AudioService.cleanup();
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      await AudioService.startRecording();
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await AudioService.stopRecording();
      if (uri) {
        setRecordedUri(uri);
        setIsRecording(false);
        Alert.alert('Success', 'Recording saved successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handlePlayRecording = async () => {
    if (recordedUri) {
      await AudioService.playAudio(recordedUri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>شاشة الترتيل</Text>
      <Text style={styles.subtitle}>اختر سورة للبدء في التلاوة</Text>
      
      <View style={styles.surahList}>
        <TouchableOpacity style={styles.surahItem}>
          <Text style={styles.surahName}>الفاتحة</Text>
          <Text style={styles.ayahCount}>7 آيات</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.surahItem}>
          <Text style={styles.surahName}>البقرة</Text>
          <Text style={styles.ayahCount}>286 آية</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.surahItem}>
          <Text style={styles.surahName}>آل عمران</Text>
          <Text style={styles.ayahCount}>200 آية</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.audioControls}>
        {!isRecording ? (
          <TouchableOpacity 
            style={[styles.controlButton, styles.recordButton]}
            onPress={handleStartRecording}
          >
            <Text style={styles.buttonText}>بدء التسجيل</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStopRecording}
          >
            <Text style={styles.buttonText}>إيقاف التسجيل</Text>
          </TouchableOpacity>
        )}
        
        {recordedUri && (
          <TouchableOpacity 
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlayRecording}
          >
            <Text style={styles.buttonText}>تشغيل التسجيل</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => console.log('Start recitation')}
      >
        <Text style={styles.buttonText}>بدء التلاوة</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976D2',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  surahList: {
    flex: 1,
  },
  surahItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ayahCount: {
    fontSize: 14,
    color: '#666',
  },
  audioControls: {
    marginVertical: 20,
    alignItems: 'center',
  },
  controlButton: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#F44336',
  },
  stopButton: {
    backgroundColor: '#FF9800',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  startButton: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RecitationScreen;