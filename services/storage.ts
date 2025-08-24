import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  NO_REP_WORDS: 'reading.no-rep.words',
  NO_REP_SENTENCES: 'reading.no-rep.sentences',
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
    return this.getStoredItems(STORAGE_KEYS.NO_REP_WORDS);
  }

  static async getDisplayedSentences(): Promise<string[]> {
    return this.getStoredItems(STORAGE_KEYS.NO_REP_SENTENCES);
  }

  static async addDisplayedWords(words: string[]): Promise<void> {
    const existing = await this.getDisplayedWords();
    const unique = Array.from(new Set([...existing, ...words]));
    await this.setStoredItems(STORAGE_KEYS.NO_REP_WORDS, unique);
  }

  static async addDisplayedSentences(sentences: string[]): Promise<void> {
    const existing = await this.getDisplayedSentences();
    const unique = Array.from(new Set([...existing, ...sentences]));
    await this.setStoredItems(STORAGE_KEYS.NO_REP_SENTENCES, unique);
  }

  static async clearDisplayedWords(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.NO_REP_WORDS);
  }

  static async clearDisplayedSentences(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.NO_REP_SENTENCES);
  }

  static async clearAll(): Promise<void> {
    await Promise.all([
      this.clearDisplayedWords(),
      this.clearDisplayedSentences(),
    ]);
  }
}