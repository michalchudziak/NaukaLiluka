import AsyncStorage from '@react-native-async-storage/async-storage';
import { isToday } from 'date-fns';

const STORAGE_KEYS = {
  PROGRESS_NO_REP_WORDS: 'progress.reading.no-rep.words',
  PROGRESS_NO_REP_SENTENCES: 'progress.reading.no-rep.sentences',
  ROUTINES_NO_REP_WORDS: 'routines.reading.no-rep.words',
  ROUTINES_NO_REP_SENTENCES: 'routines.reading.no-rep.sentences',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export class StorageService {
  private static async getStoredItems(key: StorageKey): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return [];
    }
  }

  private static async setStoredItems(key: StorageKey, items: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
    }
  }

  static async getDisplayedWords(): Promise<string[]> {
    return this.getStoredItems(STORAGE_KEYS.PROGRESS_NO_REP_WORDS);
  }

  static async getDisplayedSentences(): Promise<string[]> {
    return this.getStoredItems(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES);
  }

  static async addDisplayedWords(words: string[]): Promise<void> {
    const existing = await this.getDisplayedWords();
    const unique = Array.from(new Set([...existing, ...words]));
    await this.setStoredItems(STORAGE_KEYS.PROGRESS_NO_REP_WORDS, unique);
  }

  static async addDisplayedSentences(sentences: string[]): Promise<void> {
    const existing = await this.getDisplayedSentences();
    const unique = Array.from(new Set([...existing, ...sentences]));
    await this.setStoredItems(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES, unique);
  }

  static async clearDisplayedWords(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS_NO_REP_WORDS);
  }

  static async clearDisplayedSentences(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS_NO_REP_SENTENCES);
  }

  static async clearAll(): Promise<void> {
    await Promise.all([
      this.clearDisplayedWords(),
      this.clearDisplayedSentences(),
    ]);
  }


  static async markWordsCompleted(): Promise<void> {
    try {
      const key = STORAGE_KEYS.ROUTINES_NO_REP_WORDS;
      const stored = await AsyncStorage.getItem(key);
      const timestamps = stored ? JSON.parse(stored) : [];
      timestamps.push(Date.now());
      await AsyncStorage.setItem(key, JSON.stringify(timestamps));
    } catch (error) {
      console.error('Error marking words as completed:', error);
    }
  }

  static async markSentencesCompleted(): Promise<void> {
    try {
      const key = STORAGE_KEYS.ROUTINES_NO_REP_SENTENCES;
      const stored = await AsyncStorage.getItem(key);
      const timestamps = stored ? JSON.parse(stored) : [];
      timestamps.push(Date.now());
      await AsyncStorage.setItem(key, JSON.stringify(timestamps));
    } catch (error) {
      console.error('Error marking sentences as completed:', error);
    }
  }

  static async isWordsCompletedToday(): Promise<boolean> {
    try {
      const key = STORAGE_KEYS.ROUTINES_NO_REP_WORDS;
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return false;
      
      const timestamps: number[] = JSON.parse(stored);
      return timestamps.some(timestamp => isToday(timestamp));
    } catch (error) {
      console.error('Error checking words completion:', error);
      return false;
    }
  }

  static async isSentencesCompletedToday(): Promise<boolean> {
    try {
      const key = STORAGE_KEYS.ROUTINES_NO_REP_SENTENCES;
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return false;
      
      const timestamps: number[] = JSON.parse(stored);
      return timestamps.some(timestamp => isToday(timestamp));
    } catch (error) {
      console.error('Error checking sentences completion:', error);
      return false;
    }
  }

  static async isNoRepPathCompletedToday(): Promise<boolean> {
    try {
      const [wordsCompleted, sentencesCompleted] = await Promise.all([
        this.isWordsCompletedToday(),
        this.isSentencesCompletedToday(),
      ]);
      
      return wordsCompleted && sentencesCompleted;
    } catch (error) {
      console.error('Error checking no-rep path completion:', error);
      return false;
    }
  }
}