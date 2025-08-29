import { useState, useCallback } from 'react';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'BASICS' | 'ANALYSIS' | 'STRATEGY' | 'RISK' | 'INDIAN_MARKETS';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // minutes
  reward: number; // coins
  lessons: Lesson[];
  quiz: Quiz;
  completed: boolean;
  progress: number; // 0-100
  unlocked: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'VIDEO' | 'INTERACTIVE';
  completed: boolean;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passed: boolean;
  score: number;
  attempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  unlockedAt?: number;
  category: string;
  progress: number;
  target: number;
}

export interface LearningProgress {
  totalCoinsEarned: number;
  modulesCompleted: number;
  quizzesPassed: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number; // minutes
  achievements: Achievement[];
  level: number;
  experiencePoints: number;
}

const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'investing-basics',
    title: 'Investing Basics',
    description: 'Learn the fundamentals of stock market investing',
    category: 'BASICS',
    difficulty: 'BEGINNER',
    duration: 20,
    reward: 500,
    completed: false,
    progress: 0,
    unlocked: true,
    lessons: [
      {
        id: 'what-is-investing',
        title: 'What is Investing?',
        content: 'Investing is the act of allocating money or capital with the expectation of generating income or profit. In the stock market, you buy shares of companies hoping their value will increase over time.',
        type: 'TEXT',
        completed: false,
      },
      {
        id: 'stocks-basics',
        title: 'Understanding Stocks',
        content: 'A stock represents ownership in a company. When you buy stocks, you become a shareholder and own a small piece of that company. Stock prices fluctuate based on company performance and market conditions.',
        type: 'TEXT',
        completed: false,
      },
      {
        id: 'risk-return',
        title: 'Risk vs Return',
        content: 'Higher potential returns usually come with higher risk. Understanding this fundamental relationship helps you make informed investment decisions based on your risk tolerance.',
        type: 'TEXT',
        completed: false,
      },
    ],
    quiz: {
      id: 'investing-basics-quiz',
      passed: false,
      score: 0,
      attempts: 0,
      questions: [
        {
          id: 'q1',
          question: 'What does owning a stock represent?',
          options: ['Lending money to a company', 'Ownership in a company', 'A guaranteed return', 'A bond certificate'],
          correctAnswer: 1,
          explanation: 'When you buy stocks, you become a shareholder and own a small piece of that company.',
        },
        {
          id: 'q2',
          question: 'What is the general relationship between risk and return?',
          options: ['Higher risk, lower return', 'No relationship', 'Higher risk, higher potential return', 'Lower risk, higher return'],
          correctAnswer: 2,
          explanation: 'Generally, investments with higher potential returns come with higher risk.',
        },
        {
          id: 'q3',
          question: 'Stock prices fluctuate based on:',
          options: ['Only company performance', 'Only market conditions', 'Company performance and market conditions', 'Government decisions only'],
          correctAnswer: 2,
          explanation: 'Stock prices are influenced by both company-specific factors and broader market conditions.',
        },
      ],
    },
  },
  {
    id: 'indian-markets',
    title: 'Indian Stock Markets',
    description: 'Understanding NSE, BSE, and how Indian markets work',
    category: 'INDIAN_MARKETS',
    difficulty: 'BEGINNER',
    duration: 25,
    reward: 750,
    completed: false,
    progress: 0,
    unlocked: true,
    lessons: [
      {
        id: 'nse-bse',
        title: 'NSE vs BSE',
        content: 'NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) are India\'s two major stock exchanges. NSE is larger by trading volume, while BSE is older. Most major stocks trade on both exchanges.',
        type: 'TEXT',
        completed: false,
      },
      {
        id: 'market-hours',
        title: 'Market Hours & Sessions',
        content: 'Indian markets operate Monday to Friday, 9:15 AM to 3:30 PM IST. Pre-market session: 9:00-9:15 AM, Regular session: 9:15 AM-3:30 PM, Post-market: 3:40-4:00 PM.',
        type: 'TEXT',
        completed: false,
      },
      {
        id: 'indices',
        title: 'Understanding Sensex & Nifty',
        content: 'Sensex tracks 30 largest companies on BSE, while Nifty 50 tracks top 50 companies on NSE. These indices represent overall market performance and sentiment.',
        type: 'TEXT',
        completed: false,
      },
    ],
    quiz: {
      id: 'indian-markets-quiz',
      passed: false,
      score: 0,
      attempts: 0,
      questions: [
        {
          id: 'q1',
          question: 'What are the trading hours for Indian stock markets?',
          options: ['9:00 AM - 4:00 PM', '9:15 AM - 3:30 PM', '10:00 AM - 4:00 PM', '9:30 AM - 4:00 PM'],
          correctAnswer: 1,
          explanation: 'Indian markets operate from 9:15 AM to 3:30 PM IST, Monday to Friday.',
        },
        {
          id: 'q2',
          question: 'How many companies does the Nifty 50 index track?',
          options: ['30', '50', '100', '500'],
          correctAnswer: 1,
          explanation: 'Nifty 50 tracks the top 50 companies listed on NSE.',
        },
        {
          id: 'q3',
          question: 'Which is the older stock exchange in India?',
          options: ['NSE', 'BSE', 'MSE', 'CSE'],
          correctAnswer: 1,
          explanation: 'BSE (Bombay Stock Exchange) is older, established in 1875, while NSE was established in 1992.',
        },
      ],
    },
  },
  {
    id: 'fundamental-analysis',
    title: 'Fundamental Analysis',
    description: 'Learn to analyze company fundamentals and financial statements',
    category: 'ANALYSIS',
    difficulty: 'INTERMEDIATE',
    duration: 35,
    reward: 1000,
    completed: false,
    progress: 0,
    unlocked: false,
    lessons: [
      {
        id: 'financial-statements',
        title: 'Reading Financial Statements',
        content: 'Learn to interpret Balance Sheets, Income Statements, and Cash Flow statements. These documents reveal a company\'s financial health and performance.',
        type: 'TEXT',
        completed: false,
      },
      {
        id: 'key-ratios',
        title: 'Key Financial Ratios',
        content: 'Important ratios include P/E ratio, ROE, Debt-to-Equity, and Current Ratio. These help evaluate company performance and compare with peers.',
        type: 'TEXT',
        completed: false,
      },
    ],
    quiz: {
      id: 'fundamental-analysis-quiz',
      passed: false,
      score: 0,
      attempts: 0,
      questions: [
        {
          id: 'q1',
          question: 'What does P/E ratio measure?',
          options: ['Profit margin', 'Price relative to earnings', 'Debt level', 'Revenue growth'],
          correctAnswer: 1,
          explanation: 'P/E ratio compares the current share price to the per-share earnings.',
        },
      ],
    },
  },
  {
    id: 'risk-management',
    title: 'Risk Management',
    description: 'Learn how to protect your investments and manage risk',
    category: 'RISK',
    difficulty: 'INTERMEDIATE',
    duration: 30,
    reward: 1000,
    completed: false,
    progress: 0,
    unlocked: false,
    lessons: [
      {
        id: 'diversification',
        title: 'Portfolio Diversification',
        content: 'Don\'t put all eggs in one basket. Spread investments across different sectors, companies, and asset classes to reduce risk.',
        type: 'TEXT',
        completed: false,
      },
      {
        id: 'stop-loss',
        title: 'Stop Loss Orders',
        content: 'A stop loss automatically sells your stock when it reaches a predetermined price, limiting your losses on any investment.',
        type: 'TEXT',
        completed: false,
      },
    ],
    quiz: {
      id: 'risk-management-quiz',
      passed: false,
      score: 0,
      attempts: 0,
      questions: [
        {
          id: 'q1',
          question: 'What is the main purpose of diversification?',
          options: ['Maximize returns', 'Reduce risk', 'Increase trading frequency', 'Follow market trends'],
          correctAnswer: 1,
          explanation: 'Diversification helps reduce risk by spreading investments across different assets.',
        },
      ],
    },
  },
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'Knowledge Seeker',
    description: 'Complete your first lesson',
    icon: '📚',
    reward: 100,
    unlocked: false,
    category: 'Learning',
    progress: 0,
    target: 1,
  },
  {
    id: 'first-quiz',
    title: 'Quiz Master',
    description: 'Pass your first quiz',
    icon: '🎯',
    reward: 200,
    unlocked: false,
    category: 'Learning',
    progress: 0,
    target: 1,
  },
  {
    id: 'five-modules',
    title: 'Dedicated Learner',
    description: 'Complete 5 learning modules',
    icon: '🌟',
    reward: 500,
    unlocked: false,
    category: 'Learning',
    progress: 0,
    target: 5,
  },
  {
    id: 'perfect-score',
    title: 'Perfect Scholar',
    description: 'Score 100% on any quiz',
    icon: '💯',
    reward: 300,
    unlocked: false,
    category: 'Achievement',
    progress: 0,
    target: 1,
  },
];

export function useLearning() {
  const [modules, setModules] = useState<LearningModule[]>(LEARNING_MODULES);
  const [progress, setProgress] = useState<LearningProgress>({
    totalCoinsEarned: 0,
    modulesCompleted: 0,
    quizzesPassed: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTimeSpent: 0,
    achievements: ACHIEVEMENTS,
    level: 1,
    experiencePoints: 0,
  });

  const completeLesson = useCallback((moduleId: string, lessonId: string) => {
    setModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        const updatedLessons = module.lessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        );
        const completedLessons = updatedLessons.filter(l => l.completed).length;
        const newProgress = (completedLessons / updatedLessons.length) * 50; // 50% for lessons, 50% for quiz
        
        return {
          ...module,
          lessons: updatedLessons,
          progress: newProgress,
        };
      }
      return module;
    }));

    // Check for achievements
    checkAchievements('lesson_completed');
  }, []);

  const submitQuiz = useCallback((moduleId: string, answers: number[]): { passed: boolean; score: number } => {
    let result = { passed: false, score: 0 };
    
    setModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        const quiz = module.quiz;
        const correctAnswers = answers.filter((answer, index) => 
          answer === quiz.questions[index].correctAnswer
        ).length;
        
        const score = Math.round((correctAnswers / quiz.questions.length) * 100);
        const passed = score >= 70; // 70% passing grade
        
        result = { passed, score };
        
        const updatedQuiz = {
          ...quiz,
          score,
          passed,
          attempts: quiz.attempts + 1,
        };

        let newProgress = module.progress;
        if (passed) {
          newProgress = 100; // Module completed
          
          // Unlock next module
          const moduleIndex = prev.findIndex(m => m.id === moduleId);
          if (moduleIndex < prev.length - 1) {
            prev[moduleIndex + 1].unlocked = true;
          }
        }

        return {
          ...module,
          quiz: updatedQuiz,
          progress: newProgress,
          completed: passed,
        };
      }
      return module;
    }));

    if (result.passed) {
      // Update progress
      setProgress(prev => ({
        ...prev,
        modulesCompleted: prev.modulesCompleted + 1,
        quizzesPassed: prev.quizzesPassed + 1,
        experiencePoints: prev.experiencePoints + 100,
      }));

      // Check for achievements
      checkAchievements('quiz_passed', result.score);
    }

    return result;
  }, []);

  const checkAchievements = useCallback((event: string, data?: any) => {
    setProgress(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement => {
        if (achievement.unlocked) return achievement;

        let shouldUnlock = false;
        let newProgress = achievement.progress;

        switch (achievement.id) {
          case 'first-lesson':
            if (event === 'lesson_completed') {
              newProgress = 1;
              shouldUnlock = true;
            }
            break;
          case 'first-quiz':
            if (event === 'quiz_passed') {
              newProgress = 1;
              shouldUnlock = true;
            }
            break;
          case 'five-modules':
            if (event === 'quiz_passed') {
              newProgress = Math.min(prev.modulesCompleted + 1, 5);
              shouldUnlock = newProgress >= 5;
            }
            break;
          case 'perfect-score':
            if (event === 'quiz_passed' && data === 100) {
              newProgress = 1;
              shouldUnlock = true;
            }
            break;
        }

        if (shouldUnlock) {
          return {
            ...achievement,
            unlocked: true,
            unlockedAt: Date.now(),
            progress: newProgress,
          };
        }

        return {
          ...achievement,
          progress: newProgress,
        };
      }),
    }));
  }, []);

  const getAvailableModules = useCallback(() => {
    return modules.filter(module => module.unlocked);
  }, [modules]);

  const getModuleById = useCallback((id: string) => {
    return modules.find(module => module.id === id);
  }, [modules]);

  const calculateLevel = useCallback((experiencePoints: number) => {
    return Math.floor(experiencePoints / 500) + 1; // 500 XP per level
  }, []);

  const getUnlockedAchievements = useCallback(() => {
    return progress.achievements.filter(achievement => achievement.unlocked);
  }, [progress.achievements]);

  return {
    modules,
    progress: {
      ...progress,
      level: calculateLevel(progress.experiencePoints),
    },
    completeLesson,
    submitQuiz,
    getAvailableModules,
    getModuleById,
    getUnlockedAchievements,
  };
}
