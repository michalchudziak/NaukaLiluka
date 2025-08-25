import sentencesData from '@/content/no-rep/sentences.json';
import wordsData from '@/content/no-rep/words.json';
import { HybridStorageService } from '@/services/hybrid-storage';
import { AsyncStorageService } from '@/services/async-storage';
import { useSettingsStore } from '@/store/settings-store';
import { isToday } from 'date-fns';
import { create } from 'zustand';

const STORAGE_KEYS = {
  PROGRESS_NO_REP_WORDS: 'progress.reading.no-rep.words',
  PROGRESS_NO_REP_SENTENCES: 'progress.reading.no-rep.sentences',
  ROUTINES_NO_REP_WORDS: 'routines.reading.no-rep.words',
  ROUTINES_NO_REP_SENTENCES: 'routines.reading.no-rep.sentences',
} as const;

function getRandomItems<T>(array: T[], count: number, exclude: T[] = []): T[] {
  const available = array.filter(item => !exclude.includes(item));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface NoRepStore {
  displayedWords: string[];
  displayedSentences: string[];
  wordCompletionTimestamps: number[];
  sentenceCompletionTimestamps: number[];
  
  addDisplayedWords: (words: string[]) => void;
  addDisplayedSentences: (sentences: string[]) => void;
  clearDisplayedWords: () => void;
  clearDisplayedSentences: () => void;
  clearAll: () => void;
  
  chooseAndMarkWords: () => Promise<string[]>;
  chooseAndMarkSentences: () => Promise<string[]>;
  
  markWordsCompleted: () => void;
  markSentencesCompleted: () => void;
  isWordsCompletedToday: () => boolean;
  isSentencesCompletedToday: () => boolean;
  isNoRepPathCompletedToday: () => boolean;
  
  hydrate: () => Promise<void>;
}

export const useNoRepStore = create<NoRepStore>((set, get) => ({
  displayedWords: [],
  displayedSentences: [],
  wordCompletionTimestamps: [],
  sentenceCompletionTimestamps: [],
  
  addDisplayedWords: (words: string[]) => {
    const newState = {
      displayedWords: Array.from(new Set([...get().displayedWords, ...words]))
    };
    set(newState);
    HybridStorageService.writeNoRepWords(STORAGE_KEYS.PROGRESS_NO_REP_WORDS, newState.displayedWords);
  },
  
  addDisplayedSentences: (sentences: string[]) => {
    const newState = {
      displayedSentences: Array.from(new Set([...get().displayedSentences, ...sentences]))
    };
    set(newState);
    HybridStorageService.writeNoRepSentences(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES, newState.displayedSentences);
  },
  
  clearDisplayedWords: () => {
    set({ displayedWords: [] });
    HybridStorageService.clear(STORAGE_KEYS.PROGRESS_NO_REP_WORDS);
  },
  
  clearDisplayedSentences: () => {
    set({ displayedSentences: [] });
    HybridStorageService.clear(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES);
  },
  
  clearAll: () => {
    set({ displayedWords: [], displayedSentences: [] });
    HybridStorageService.clear(STORAGE_KEYS.PROGRESS_NO_REP_WORDS);
    HybridStorageService.clear(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES);
  },
  
  chooseAndMarkWords: async () => {
    const state = get();
    const settings = useSettingsStore.getState();
    const randomWords = getRandomItems(wordsData, settings.reading.noRep.words, state.displayedWords);
    
    if (randomWords.length === 0) {
      return [];
    }
    
    state.addDisplayedWords(randomWords);
    state.markWordsCompleted();
    
    return randomWords;
  },
  
  chooseAndMarkSentences: async () => {
    const state = get();
    const settings = useSettingsStore.getState();
    const randomSentences = getRandomItems(sentencesData, settings.reading.noRep.sentences, state.displayedSentences);
    
    if (randomSentences.length === 0) {
      return [];
    }
    
    state.addDisplayedSentences(randomSentences);
    state.markSentencesCompleted();
    
    return randomSentences;
  },
  
  markWordsCompleted: () => {
    const newTimestamps = [...get().wordCompletionTimestamps, Date.now()];
    set({ wordCompletionTimestamps: newTimestamps });
    HybridStorageService.writeNoRepWordCompletions(STORAGE_KEYS.ROUTINES_NO_REP_WORDS, newTimestamps);
  },
  
  markSentencesCompleted: () => {
    const newTimestamps = [...get().sentenceCompletionTimestamps, Date.now()];
    set({ sentenceCompletionTimestamps: newTimestamps });
    HybridStorageService.writeNoRepSentenceCompletions(STORAGE_KEYS.ROUTINES_NO_REP_SENTENCES, newTimestamps);
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
    await HybridStorageService.initialize();
    const [storedWords, storedSentences, storedWordTimestamps, storedSentenceTimestamps] = await Promise.all([
      HybridStorageService.readNoRepWords(STORAGE_KEYS.PROGRESS_NO_REP_WORDS),
      HybridStorageService.readNoRepSentences(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES),
      HybridStorageService.readNoRepWordCompletions(STORAGE_KEYS.ROUTINES_NO_REP_WORDS),
      HybridStorageService.readNoRepSentenceCompletions(STORAGE_KEYS.ROUTINES_NO_REP_SENTENCES)
    ]);
    
    set({
      displayedWords: storedWords || [],
      displayedSentences: storedSentences || [],
      wordCompletionTimestamps: storedWordTimestamps || [],
      sentenceCompletionTimestamps: storedSentenceTimestamps || []
    });
  }
}));