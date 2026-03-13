import { isToday } from 'date-fns';
import { create } from 'zustand';
import sentencesData from '@/content/no-rep/sentences.json';
import wordsData from '@/content/no-rep/words.json';
import { ConvexService, ignoreCloudFailure } from '@/services/convex';
import { useSettingsStore } from '@/store/settings-store';

function getRandomItems<T>(array: T[], count: number, exclude: T[] = []): T[] {
  const available = array.filter((item) => !exclude.includes(item));
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

  chooseAndMarkWords: () => Promise<string[]>;
  chooseAndMarkSentences: () => Promise<string[]>;

  markWordsCompleted: () => void;
  markSentencesCompleted: () => void;
  isWordsCompletedToday: () => boolean;
  isSentencesCompletedToday: () => boolean;
  isNoRepPathCompletedToday: () => boolean;

  bootstrap: () => Promise<void>;
}

export const useNoRepStore = create<NoRepStore>((set, get) => ({
  displayedWords: [],
  displayedSentences: [],
  wordCompletionTimestamps: [],
  sentenceCompletionTimestamps: [],

  addDisplayedWords: (words: string[]) => {
    const newState = {
      displayedWords: Array.from(new Set([...get().displayedWords, ...words])),
    };
    set(newState);
    void ConvexService.updateNoRepProgress('words', newState.displayedWords).catch(
      ignoreCloudFailure
    );
  },

  addDisplayedSentences: (sentences: string[]) => {
    const newState = {
      displayedSentences: Array.from(new Set([...get().displayedSentences, ...sentences])),
    };
    set(newState);
    void ConvexService.updateNoRepProgress('sentences', newState.displayedSentences).catch(
      ignoreCloudFailure
    );
  },

  chooseAndMarkWords: async () => {
    const state = get();
    const settings = useSettingsStore.getState();
    const randomWords = getRandomItems(
      wordsData,
      settings.reading.noRep.words,
      state.displayedWords
    );

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
    const randomSentences = getRandomItems(
      sentencesData,
      settings.reading.noRep.sentences,
      state.displayedSentences
    );

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
    void ConvexService.saveNoRepCompletion('words').catch(ignoreCloudFailure);
  },

  markSentencesCompleted: () => {
    const newTimestamps = [...get().sentenceCompletionTimestamps, Date.now()];
    set({ sentenceCompletionTimestamps: newTimestamps });
    void ConvexService.saveNoRepCompletion('sentences').catch(ignoreCloudFailure);
  },

  isWordsCompletedToday: () => {
    return get().wordCompletionTimestamps.some((timestamp) => isToday(timestamp));
  },

  isSentencesCompletedToday: () => {
    return get().sentenceCompletionTimestamps.some((timestamp) => isToday(timestamp));
  },

  isNoRepPathCompletedToday: () => {
    const wordsCompleted = get().isWordsCompletedToday();
    const sentencesCompleted = get().isSentencesCompletedToday();
    return wordsCompleted && sentencesCompleted;
  },

  bootstrap: async () => {
    const [storedWords, storedSentences, storedWordTimestamps, storedSentenceTimestamps] =
      await Promise.all([
        ConvexService.getNoRepProgress('words'),
        ConvexService.getNoRepProgress('sentences'),
        ConvexService.getNoRepCompletions('words'),
        ConvexService.getNoRepCompletions('sentences'),
      ]);

    set({
      displayedWords: storedWords || [],
      displayedSentences: storedSentences || [],
      wordCompletionTimestamps: storedWordTimestamps || [],
      sentenceCompletionTimestamps: storedSentenceTimestamps || [],
    });
  },
}));
