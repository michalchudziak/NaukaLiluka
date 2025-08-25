import sentencesData from '@/content/no-rep/sentences.json';
import wordsData from '@/content/no-rep/words.json';
import { AsyncStorageService } from '@/services/async-storage';
import { DefaultSettings } from '@/services/default-settings';
import { create } from 'zustand';
import { useRoutinesStore } from './routines-store';

const STORAGE_KEYS = {
  PROGRESS_NO_REP_WORDS: 'progress.reading.no-rep.words',
  PROGRESS_NO_REP_SENTENCES: 'progress.reading.no-rep.sentences',
} as const;

function getRandomItems<T>(array: T[], count: number, exclude: T[] = []): T[] {
  const available = array.filter(item => !exclude.includes(item));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface NoRepStore {
  displayedWords: string[];
  displayedSentences: string[];
  
  addDisplayedWords: (words: string[]) => void;
  addDisplayedSentences: (sentences: string[]) => void;
  clearDisplayedWords: () => void;
  clearDisplayedSentences: () => void;
  clearAll: () => void;
  
  chooseAndMarkWords: () => Promise<string[]>;
  chooseAndMarkSentences: () => Promise<string[]>;
  
  hydrate: () => Promise<void>;
}

export const useNoRepStore = create<NoRepStore>((set, get) => ({
  displayedWords: [],
  displayedSentences: [],
  
  addDisplayedWords: (words: string[]) => {
    const newState = {
      displayedWords: Array.from(new Set([...get().displayedWords, ...words]))
    };
    set(newState);
    AsyncStorageService.write(STORAGE_KEYS.PROGRESS_NO_REP_WORDS, newState.displayedWords);
  },
  
  addDisplayedSentences: (sentences: string[]) => {
    const newState = {
      displayedSentences: Array.from(new Set([...get().displayedSentences, ...sentences]))
    };
    set(newState);
    AsyncStorageService.write(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES, newState.displayedSentences);
  },
  
  clearDisplayedWords: () => {
    set({ displayedWords: [] });
    AsyncStorageService.clear(STORAGE_KEYS.PROGRESS_NO_REP_WORDS);
  },
  
  clearDisplayedSentences: () => {
    set({ displayedSentences: [] });
    AsyncStorageService.clear(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES);
  },
  
  clearAll: () => {
    set({ displayedWords: [], displayedSentences: [] });
    AsyncStorageService.clear(STORAGE_KEYS.PROGRESS_NO_REP_WORDS);
    AsyncStorageService.clear(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES);
  },
  
  chooseAndMarkWords: async () => {
    const state = get();
    const randomWords = getRandomItems(wordsData, DefaultSettings.reading.noRep.words, state.displayedWords);
    
    if (randomWords.length === 0) {
      return [];
    }
    
    state.addDisplayedWords(randomWords);
    useRoutinesStore.getState().markWordsCompleted();
    
    return randomWords;
  },
  
  chooseAndMarkSentences: async () => {
    const state = get();
    const randomSentences = getRandomItems(sentencesData, DefaultSettings.reading.noRep.sentences, state.displayedSentences);
    
    if (randomSentences.length === 0) {
      return [];
    }
    
    state.addDisplayedSentences(randomSentences);
    useRoutinesStore.getState().markSentencesCompleted();
    
    return randomSentences;
  },
  
  hydrate: async () => {
    const [storedWords, storedSentences] = await Promise.all([
      AsyncStorageService.read(STORAGE_KEYS.PROGRESS_NO_REP_WORDS),
      AsyncStorageService.read(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES)
    ]);
    
    set({
      displayedWords: storedWords || [],
      displayedSentences: storedSentences || []
    });
  }
}));