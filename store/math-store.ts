
import { HybridStorageService } from '@/services/hybrid-storage';
import { isSameDay, isToday, parseISO } from 'date-fns';
import { create } from 'zustand';

const getNumbersLearningScheme = (day: number) => {
  if (day > 30) {
    return {
      data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 150)).sort(() => Math.random() - 0.5),
      actualNumbers: true,
    }
  }

  if (day > 15) {
    return {
      data: Array.from({ length: 10 }, (_, i) => i + (day - 16) * 10),  
      actualNumbers: true,
    }
  }

  return {
    data: Array.from({ length: 10 }, (_, i) => i + (day - 1) * 10),
    actualNumbers: false,
  }
}

const STORAGE_KEYS = {
  MATH_PROGRESS: 'progress.math',
  MATH_SESSION_COMPLETIONS: 'routines.math.sessions',
} as const;

interface MathProgress {
  completedDays: number[]; // array of completed day numbers
  currentDay: number; // current day in the learning scheme
  lastPracticeDate: string | null; // ISO date string of last practice
  lastDayCompleted: boolean; // whether the last practiced day was completed
}

interface MathSessionCompletion {
  session: 'session1' | 'session2';
  timestamp: number;
}

export interface MathDailyData {
  dayNumber: number;
  numbers: number[];
  actualNumbers: boolean;
}

interface MathStore {
  mathProgress: MathProgress | null;
  mathSessionCompletions: MathSessionCompletion[];
  
  initializeMathProgress: () => void;
  getDailyData: () => MathDailyData | null;
  markSessionCompleted: (session: 'session1' | 'session2') => void;
  isDayCompleted: () => boolean;
  isSessionCompletedToday: (session: 'session1' | 'session2') => boolean;
  getNumbersForDisplay: (type: 'ordered' | 'unordered') => number[];
  hydrate: () => Promise<void>;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useMathStore = create<MathStore>((set, get) => ({
  mathProgress: null,
  mathSessionCompletions: [],
  
  initializeMathProgress: () => {
    const progress: MathProgress = {
      completedDays: [],
      currentDay: 1,
      lastPracticeDate: null,
      lastDayCompleted: false,
    };
    
    set({ mathProgress: progress });
    HybridStorageService.writeMathProgress(STORAGE_KEYS.MATH_PROGRESS, progress);
  },
  
  getDailyData: () => {
    const state = get();
    let progress = state.mathProgress;
    
    if (!progress) {
      state.initializeMathProgress();
      progress = get().mathProgress;
    }
    
    if (!progress) return null;
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const isNewDay = !progress.lastPracticeDate || !isSameDay(parseISO(progress.lastPracticeDate), today);
    // const isNewDay = true;
    
    // If it's a new day and the previous day was completed, advance to next day
    if (isNewDay && progress.lastDayCompleted && progress.lastPracticeDate) {
      const nextDay = progress.currentDay + 1;
      const updatedProgress: MathProgress = {
        ...progress,
        completedDays: [...progress.completedDays, progress.currentDay],
        currentDay: nextDay,
        lastPracticeDate: todayString,
        lastDayCompleted: false,
      };
      set({ mathProgress: updatedProgress });
      HybridStorageService.writeMathProgress(STORAGE_KEYS.MATH_PROGRESS, updatedProgress);
      progress = updatedProgress;
    } else if (isNewDay) {
      // New day but previous day not completed, just update the practice date
      const updatedProgress: MathProgress = {
        ...progress,
        lastPracticeDate: todayString,
        lastDayCompleted: false,
      };
      set({ mathProgress: updatedProgress });
      HybridStorageService.writeMathProgress(STORAGE_KEYS.MATH_PROGRESS, updatedProgress);
      progress = updatedProgress;
    }
    
    // Clear session completions on new day
    if (isNewDay) {
      set({ mathSessionCompletions: [] });
      HybridStorageService.writeMathSessions(STORAGE_KEYS.MATH_SESSION_COMPLETIONS, []);
    }
    
    const scheme = getNumbersLearningScheme(progress.currentDay);
    return {
      dayNumber: progress.currentDay,
      numbers: scheme.data,
      actualNumbers: scheme.actualNumbers,
    };
  },
  
  
  markSessionCompleted: (session: 'session1' | 'session2') => {
    // Add completion record
    const newCompletion: MathSessionCompletion = {
      session,
      timestamp: Date.now(),
    };
    const newCompletions = [...get().mathSessionCompletions, newCompletion];
    set({ mathSessionCompletions: newCompletions });
    HybridStorageService.writeMathSessions(STORAGE_KEYS.MATH_SESSION_COMPLETIONS, newCompletions);
    
    // Check if the entire day is completed and update progress
    const state = get();
    if (state.isDayCompleted()) {
      const progress = state.mathProgress;
      if (progress) {
        const updatedProgress: MathProgress = {
          ...progress,
          lastDayCompleted: true,
        };
        set({ mathProgress: updatedProgress });
        HybridStorageService.writeMathProgress(STORAGE_KEYS.MATH_PROGRESS, updatedProgress);
      }
    }
  },
  
  isDayCompleted: () => {
    const todayCompletions = get().mathSessionCompletions.filter(c => isToday(c.timestamp));
    
    // Check if both sessions are completed today
    const session1Complete = todayCompletions.some(c => c.session === 'session1');
    const session2Complete = todayCompletions.some(c => c.session === 'session2');
    
    return session1Complete && session2Complete;
  },
  
  
  isSessionCompletedToday: (session: 'session1' | 'session2') => {
    const todayCompletions = get().mathSessionCompletions.filter(c => isToday(c.timestamp));
    return todayCompletions.some(c => c.session === session);
  },
  
  
  getNumbersForDisplay: (type: 'ordered' | 'unordered') => {
    const dailyData = get().getDailyData();
    if (!dailyData) return [];
    
    if (type === 'ordered') {
      return dailyData.numbers;
    } else {
      return shuffleArray(dailyData.numbers);
    }
  },
  
  hydrate: async () => {
    await HybridStorageService.initialize();
    const [storedProgress, storedSessions] = await Promise.all([
      HybridStorageService.readMathProgress(STORAGE_KEYS.MATH_PROGRESS),
      HybridStorageService.readMathSessions(STORAGE_KEYS.MATH_SESSION_COMPLETIONS),
    ]);
    
    const state: Partial<MathStore> = {};
    
    if (storedProgress) {
      state.mathProgress = storedProgress;
    } else {
      // Initialize if no stored progress
      get().initializeMathProgress();
    }
    
    if (storedSessions) {
      // Keep all sessions, they'll be cleared on new day in getDailyData
      state.mathSessionCompletions = storedSessions;
    }
    
    if (Object.keys(state).length > 0) {
      set(state);
    }
  },
}));