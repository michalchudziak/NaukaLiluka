import { create } from 'zustand';
import { AsyncStorageService } from '@/services/async-storage';
import { isToday } from 'date-fns';
import { useBookStore } from './book-store';

const STORAGE_KEYS = {
  ROUTINES_NO_REP_WORDS: 'routines.reading.no-rep.words',
  ROUTINES_NO_REP_SENTENCES: 'routines.reading.no-rep.sentences',
} as const;

interface RoutinesStore {
  wordCompletionTimestamps: number[];
  sentenceCompletionTimestamps: number[];
  
  markWordsCompleted: () => void;
  markSentencesCompleted: () => void;
  isWordsCompletedToday: () => boolean;
  isSentencesCompletedToday: () => boolean;
  isNoRepPathCompletedToday: () => boolean;
  isDailyPlanCompleted: () => boolean;
  isBookTrackCompletedToday: () => boolean;
  
  hydrate: () => Promise<void>;
}

export const useRoutinesStore = create<RoutinesStore>((set, get) => ({
  wordCompletionTimestamps: [],
  sentenceCompletionTimestamps: [],
  
  markWordsCompleted: () => {
    const newTimestamps = [...get().wordCompletionTimestamps, Date.now()];
    set({ wordCompletionTimestamps: newTimestamps });
    AsyncStorageService.write(STORAGE_KEYS.ROUTINES_NO_REP_WORDS, newTimestamps);
  },
  
  markSentencesCompleted: () => {
    const newTimestamps = [...get().sentenceCompletionTimestamps, Date.now()];
    set({ sentenceCompletionTimestamps: newTimestamps });
    AsyncStorageService.write(STORAGE_KEYS.ROUTINES_NO_REP_SENTENCES, newTimestamps);
  },
  
  isWordsCompletedToday: () => {
    return get().wordCompletionTimestamps.some(timestamp => isToday(timestamp));
  },
  
  isSentencesCompletedToday: () => {
    return get().sentenceCompletionTimestamps.some(timestamp => isToday(timestamp));
  },
  
  isNoRepPathCompletedToday: () => {
    const wordsCompleted = get().isWordsCompletedToday();
    const sentencesCompleted = get().isSentencesCompletedToday();
    return wordsCompleted && sentencesCompleted;
  },
  
  isDailyPlanCompleted: () => {
    const bookStore = useBookStore.getState();
    const plan = bookStore.dailyPlan;
    if (!plan) return false;
    
    const { session1, session2, session3 } = plan.sessions;
    
    // Check if all required items in each session are completed
    const session1Complete = 
      (session1.words.length === 0 || session1.isWordsCompleted) &&
      (session1.sentences.length === 0 || session1.isSentencesCompleted);
    
    const session2Complete = 
      (session2.words.length === 0 || session2.isWordsCompleted) &&
      (session2.sentences.length === 0 || session2.isSentencesCompleted);
    
    const session3Complete = 
      (session3.words.length === 0 || session3.isWordsCompleted) &&
      (session3.sentences.length === 0 || session3.isSentencesCompleted);
    
    return session1Complete && session2Complete && session3Complete;
  },
  
  isBookTrackCompletedToday: () => {
    const bookStore = useBookStore.getState();
    const plan = bookStore.dailyPlan;
    if (!plan) return false;
    
    // Check if the plan is for today
    const today = new Date().toISOString().split('T')[0];
    if (plan.date !== today) return false;
    
    // Check if all sessions are completed
    return get().isDailyPlanCompleted();
  },
  
  hydrate: async () => {
    const [storedWordTimestamps, storedSentenceTimestamps] = await Promise.all([
      AsyncStorageService.read(STORAGE_KEYS.ROUTINES_NO_REP_WORDS),
      AsyncStorageService.read(STORAGE_KEYS.ROUTINES_NO_REP_SENTENCES)
    ]);
    
    set({
      wordCompletionTimestamps: storedWordTimestamps || [],
      sentenceCompletionTimestamps: storedSentenceTimestamps || []
    });
  }
}));