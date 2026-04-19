import { create } from 'zustand';

export const useQuizStore = create((set, get) => ({
  // --- STATE ---
  questions: [],
  currentCategory: null,
  currentQuestionIndex: 0,
  score: 0,
  totalScore: 0, 
  timeLeft: 20, 
  isFinished: false,
  streak: 0,
  lastPlayedDate: null,
  results: {
    correct: 0,
    wrong: 0,
    history: [], 
  },
  allTimeHistory: [], 

  // --- ACTIONS ---
  setQuestions: (data, categoryId) => set({ 
    questions: data, 
    currentCategory: categoryId, 
    currentQuestionIndex: 0, 
    score: 0, 
    isFinished: false,
    timeLeft: 20,
    results: { correct: 0, wrong: 0, history: [] } 
  }),

  submitAnswer: (selectedOption) => {
    const { questions, currentQuestionIndex, results, score, totalScore, allTimeHistory, currentCategory, streak, lastPlayedDate } = get();
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    const updatedResults = {
      correct: isCorrect ? results.correct + 1 : results.correct,
      wrong: !isCorrect ? results.wrong + 1 : results.wrong,
      history: [...results.history, { 
        questionId: currentQuestion.id, 
        selectedOption, 
        isCorrect 
      }]
    };

    const newScore = isCorrect ? score + 10 : score;

    set({
      results: updatedResults,
      score: newScore,
      totalScore: isCorrect ? totalScore + 10 : totalScore,
    });

    if (currentQuestionIndex + 1 < questions.length) {
      set({ 
        currentQuestionIndex: currentQuestionIndex + 1,
        timeLeft: 20 
      });
    } else {
      // --- STREAK LOGIC ---
      const today = new Date().toDateString();
      let newStreak = streak;

      if (lastPlayedDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPlayedDate === yesterday.toDateString()) {
          newStreak += 1; 
        } else {
          newStreak = 1; 
        }
      }

      const sessionSummary = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        score: (updatedResults.correct / questions.length) * 100, 
        category: currentCategory, 
        totalQuestions: questions.length,
        correct: updatedResults.correct,
        timestamp: new Date().toISOString()
      };

      set({ 
        isFinished: true,
        allTimeHistory: [sessionSummary, ...allTimeHistory],
        streak: newStreak,
        lastPlayedDate: today
      });
    }
  },

  tick: () => {
    const { timeLeft, isFinished } = get();
    if (isFinished) return;
    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      get().submitAnswer(null); 
    }
  },

  resetQuiz: () => set({
    currentQuestionIndex: 0,
    score: 0,
    timeLeft: 20,
    isFinished: false,
    results: { correct: 0, wrong: 0, history: [] }
  })
}))