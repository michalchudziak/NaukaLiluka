
import { getNumbersLearningScheme } from '@/content/math/learning-scheme';
import { HybridStorageService } from '@/services/hybrid-storage';
import { isSameDay, isToday, parseISO } from 'date-fns';
import { create } from 'zustand';

const STORAGE_KEYS = {
  MATH_PROGRESS: 'progress.math',
  MATH_SESSION_COMPLETIONS: 'routines.math.sessions',
} as const;

interface MathProgress {
  completedDays: number[]; // array of completed day numbers
  lastPracticeDate: string | null; // ISO date string of last practice
  lastDayCompleted: boolean; // whether the last practiced day was completed
  lastCompletionDate: string | null; // ISO date string of last completion
}

interface MathSessionCompletion {
  session: 'session1' | 'session2';
  timestamp: number;
}

export interface MathDailyData {
  dayNumber: number;
  numbers: number[];
  actualNumbers: boolean;
  activeDay: number; // the day to display (might differ from currentDay)
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
      lastPracticeDate: null,
      lastDayCompleted: false,
      lastCompletionDate: null,
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
    
    // Derive current day from completedDays
    const currentDay = progress.completedDays.length > 0 
      ? Math.max(...progress.completedDays) + 1 
      : 1;
    
    // Calculate active day: if completed today, show today's content; otherwise show next day
    let activeDay = currentDay;
    if (progress.lastCompletionDate && isSameDay(parseISO(progress.lastCompletionDate), today)) {
      // If completed today, show the completed day's content
      activeDay = progress.completedDays[progress.completedDays.length - 1] || currentDay;
    }
    
    // Only update the practice date on a new calendar day
    if (isNewDay) {
      const updatedProgress: MathProgress = {
        ...progress,
        lastPracticeDate: todayString,
      };
      set({ mathProgress: updatedProgress });
      HybridStorageService.writeMathProgress(STORAGE_KEYS.MATH_PROGRESS, updatedProgress);
      progress = updatedProgress;
      
      // Clear session completions on new calendar day
      set({ mathSessionCompletions: [] });
      HybridStorageService.writeMathSessions(STORAGE_KEYS.MATH_SESSION_COMPLETIONS, []);
    }
    
    const scheme = getNumbersLearningScheme(activeDay);
    return {
      dayNumber: currentDay,
      numbers: scheme.data,
      actualNumbers: scheme.actualNumbers,
      activeDay: activeDay,
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
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        const wasCompletedToday = progress.lastCompletionDate && isSameDay(parseISO(progress.lastCompletionDate), today);
        
        // Derive current day from completedDays
        const currentDay = progress.completedDays.length > 0 
          ? Math.max(...progress.completedDays) + 1 
          : 1;
        
        if (wasCompletedToday) {
          // If already completed today, just update the completion timestamp
          const updatedProgress: MathProgress = {
            ...progress,
            lastCompletionDate: todayString,
            lastDayCompleted: true,
          };
          set({ mathProgress: updatedProgress });
          HybridStorageService.writeMathProgress(STORAGE_KEYS.MATH_PROGRESS, updatedProgress);
        } else {
          // Mark current day as completed and save completion date
          const updatedProgress: MathProgress = {
            ...progress,
            completedDays: [...progress.completedDays, currentDay],
            lastPracticeDate: todayString,
            lastCompletionDate: todayString,
            lastDayCompleted: true,
          };
          set({ mathProgress: updatedProgress });
          HybridStorageService.writeMathProgress(STORAGE_KEYS.MATH_PROGRESS, updatedProgress);
          
          // Don't clear session completions - they'll be cleared on the next calendar day
        }
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