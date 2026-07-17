import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AudioService from '../services/AudioService';

const PronunciationPractice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [currentVerse, setCurrentVerse] = useState("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
  const [highlightedWords, setHighlightedWords] = useState([]);

  const sampleVerses = [
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    "الرَّحْمَٰنِ الرَّحِيمِ",
    "مَالِكِ يَوْمِ الدِّينِ"
  ];

  const handleStartRecording = async () => {
    try {
      await AudioService.startRecording();
      setIsRecording(true);
      setFeedback([]);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await AudioService.stopRecording();
      if (uri) {
        setRecordedUri(uri);
        setIsRecording(false);
        analyzePronunciation();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const analyzePronunciation = () => {
    // Simulate pronunciation analysis
    const mockAnalysis = [
      { word: "بِسْمِ", correct: true, feedback: "ممتاز!" },
      { word: "اللَّهِ", correct: false, feedback: "تحتاج تحسين في التنوين" },
      { word: "الرَّحْمَٰنِ", correct: true, feedback: "جيد جداً" },
      { word: "الرَّحِيمِ", correct: true, feedback: "ممتاز!" }
    ];
    
    setFeedback(mockAnalysis);
    
    // Highlight incorrect words
    const incorrectWords = mockAnalysis
      .filter(item => !item.correct)
      .map(item => item.word);
    
    setHighlightedWords(incorrectWords);
  };

  const getNextVerse = () => {
    const currentIndex = sampleVerses.indexOf(currentVerse);
    const nextIndex = (currentIndex + 1) % sampleVerses.length;
    setCurrentVerse(sampleVerses[nextIndex]);
    setFeedback([]);
    setHighlightedWords([]);
  };

  const highlightWord = (word) => {
    const isIncorrect = highlightedWords.includes(word);
    return (
      <Text 
        key={word} 
        style={[
          styles.word, 
          isIncorrect && styles.incorrectWord
        ]}
      >
        {word}{' '}
      </Text>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>تمرين النطق</Text>
      
      <View style={styles.verseContainer}>
        <Text style={styles.verseLabel}>اقرأ الآية التالية:</Text>
        <View style={styles.verseDisplay}>
          {currentVerse.split(' ').map(highlightWord)}
        </View>
      </View>
      
      <View style={styles.controls}>
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
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.nextButton]}
          onPress={getNextVerse}
        >
          <Text style={styles.buttonText}>الآية التالية</Text>
        </TouchableOpacity>
      </View>
      
      {feedback.length > 0 && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>نتائج التصحيح:</Text>
          {feedback.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.feedbackItem, 
                item.correct ? styles.correctItem : styles.incorrectItem
              ]}
            >
              <Text style={styles.feedbackWord}>{item.word}</Text>
              <Text style={styles.feedbackText}>{item.feedback}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>نصائح للتحسين:</Text>
        <Text style={styles.tip}>• ركز على الحركات والتنوين</Text>
        <Text style={styles.tip}>• استمع جيداً لنموذج التلاوة</Text>
        <Text style={styles.tip}>• مارس ببطء ثم زد السرعة تدريجياً</Text>
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
  verseContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  verseLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  verseDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  word: {
    fontSize: 24,
    margin: 2,
    padding: 5,
  },
  incorrectWord: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    borderRadius: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  controlButton: {
    padding: 15,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
    margin: 5,
  },
  recordButton: {
    backgroundColor: '#F44336',
  },
  stopButton: {
    backgroundColor: '#FF9800',
  },
  nextButton: {
    backgroundColor: '#1976D2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  feedbackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  correctItem: {
    backgroundColor: '#E8F5E8',
  },
  incorrectItem: {
    backgroundColor: '#FFEBEE',
  },
  feedbackWord: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackText: {
    fontSize: 16,
    color: '#666',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default PronunciationPractice;