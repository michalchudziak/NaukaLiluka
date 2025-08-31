import AsyncStorage from '@react-native-async-storage/async-storage';

// biome-ignore lint/complexity/noStaticOnlyClass: Intentional static utility holder for API stability
export class AsyncStorageService {
  static async read(key: string): Promise<any> {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return null;
    }
  }

  static async write(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
    }
  }

  static async clear(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing storage (${key}):`, error);
    }
  }
}
