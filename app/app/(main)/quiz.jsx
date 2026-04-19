import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert, ActivityIndicator, AppState } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { QUIZ_DATA } from '../../data/questions';
import { useQuizStore } from '../../store/quizStore';
import { db } from '../../firebaseConfig';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function QuizScreen() {
  const { categoryId, categoryTitle } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  
  const { setQuestions, submitAnswer, tick, resetQuiz, isFinished, results } = useQuizStore();

  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const questions = QUIZ_DATA[categoryId] || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20); 

  const progressAnim = useRef(new Animated.Value(0)).current;
  const appState = useRef(AppState.currentState);

  // 1. Initial Setup
  useEffect(() => {
    let isMounted = true;

    const prepareQuiz = () => {
      if (questions.length > 0) {
        setQuestions(questions, categoryId);
        if (isMounted) setIsLoading(false);
        
        setTimeout(() => {
          Alert.alert(
            "Fair Play Rules 🛡️",
            `Leaving this screen clears progress.\nSwitching apps or minimizing terminates the quiz.\nScores are only saved on completion.`,
            [
              { text: "Go Back", onPress: () => router.back(), style: "cancel" },
              { text: "I Understand, Start", onPress: () => setIsStarted(true) }
            ],
            { cancelable: false }
          );
        }, 500);
      }
    };

    prepareQuiz();

    return () => {
      isMounted = false;
      resetQuiz();
    };
  }, [categoryId]);

  // For Anti-Cheat 
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (isStarted && !isFinished && appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        resetQuiz();
        setIsStarted(false);
        router.replace('/(main)');
        
        setTimeout(() => {
          Alert.alert("Terminated", "App minimized. Progress cleared.");
        }, 100);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isStarted, isFinished]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isFinished || !isStarted) return;

      e.preventDefault();

      Alert.alert(
        'Abandon Quiz?',
        'Progress will be lost.',
        [
          { text: "Stay", style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              resetQuiz();
              setIsStarted(false);
              navigation.dispatch(e.data.action); 
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isFinished, isStarted]);

  useEffect(() => {
    if (isAnswered || isFinished || !isStarted) return;

    if (timeLeft === 0) {
      handleAutoSkip();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      tick(); 
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, isFinished, isStarted]);

  useEffect(() => {
    if (questions.length > 0) {
      Animated.timing(progressAnim, {
        toValue: (currentQuestionIndex + 1) / questions.length,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentQuestionIndex]);

  const handleAutoSkip = () => {
    setIsAnswered(true);
    setSelectedOption('timeout'); 
    submitAnswer(null); 
  };

  const handleOptionPress = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 10);
    }
    submitAnswer(option);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(20);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const finalScore = score;
    setIsStarted(false);
    
    if (user?.uid) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { totalScore: increment(finalScore) });
      } catch (error) {
        console.error("Sync Error:", error);
      }
    }

    Alert.alert(
      "Quiz Completed!",
      `Score: ${finalScore}`,
      [
        { text: "Share Report", onPress: () => handleDownloadReport(finalScore) },
        { text: "Done", onPress: () => router.replace('/(main)') }
      ]
    );
  };

  if (isLoading || !isStarted) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, fontFamily: 'Ubuntu-Medium' }}>
           {isLoading ? "Loading Questions..." : "Preparing assessment..."}
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color={timeLeft < 6 ? Colors.error : Colors.primary} />
          <Text style={[styles.timerText, timeLeft < 6 && { color: Colors.error }]}>{timeLeft}s</Text>
        </View>
        <Text style={styles.progressText}>{currentQuestionIndex + 1} / {questions.length}</Text>
      </View>

      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, { 
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          })
        }]} />
      </View>

      <View style={styles.quizContent}>
        <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>

        {currentQuestion?.options.map((option, index) => {
          const isCorrect = option === currentQuestion.correctAnswer;
          const isSelected = option === selectedOption;
          
          let buttonStyle = styles.optionBtn;
          if (isAnswered) {
            if (isCorrect) buttonStyle = [styles.optionBtn, styles.correctOption];
            else if (isSelected) buttonStyle = [styles.optionBtn, styles.wrongOption];
          } else if (isSelected) {
            buttonStyle = [styles.optionBtn, styles.selectedOption];
          }

          return (
            <TouchableOpacity 
              key={index}
              style={buttonStyle}
              onPress={() => handleOptionPress(option)}
              disabled={isAnswered}
            >
              <Text style={[styles.optionText, isAnswered && isCorrect && { color: '#fff' }]}>{option}</Text>
              {isAnswered && isCorrect && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
              {isAnswered && isSelected && !isCorrect && <Ionicons name="close-circle" size={20} color="#fff" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {isAnswered && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentQuestionIndex === questions.length - 1 ? "View Results" : "Next Question"}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    marginTop: 10
  },
  timerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  timerText: { fontFamily: 'Ubuntu-Bold', fontSize: 16, color: Colors.primary },
  progressText: { fontFamily: 'Ubuntu-Medium', color: '#888' },
  progressBarBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, marginHorizontal: 20 },
  progressBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  quizContent: { padding: 25, marginTop: 10 },
  categoryTitle: { color: Colors.primary, fontFamily: 'Ubuntu-Bold', marginBottom: 8, fontSize: 14, letterSpacing: 1 },
  questionText: { fontFamily: 'Ubuntu-Bold', fontSize: 24, color: Colors.text, marginBottom: 30, lineHeight: 32, textAlign: 'center' },
  optionBtn: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 20, 
    borderRadius: 16, 
    backgroundColor: '#F8F9FA', 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  selectedOption: { borderColor: Colors.primary, backgroundColor: '#E0E7FF' },
  correctOption: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  wrongOption: { backgroundColor: Colors.error, borderColor: Colors.error },
  optionText: { fontFamily: 'Ubuntu-Medium', fontSize: 16, color: '#444' },
  nextBtn: { 
    position: 'absolute', 
    bottom: 40, 
    left: 25, 
    right: 25, 
    backgroundColor: Colors.primary, 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  nextBtnText: { color: '#fff', fontFamily: 'Ubuntu-Bold', fontSize: 18 }
});