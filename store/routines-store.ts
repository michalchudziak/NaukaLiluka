import { create } from 'zustand';
import { AsyncStorageService } from '@/services/async-storage';
import { isToday } from 'date-fns';

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