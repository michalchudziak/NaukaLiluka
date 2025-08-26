import { AsyncStorageService } from './async-storage';
import { SupabaseService } from './supabase';

const CLOUD_SETTINGS_KEY = 'settings.useCloudData';

export class HybridStorageService {
  private static useCloudData: boolean = false;
  
  static async initialize() {
    // Load cloud data preference from AsyncStorage
    const useCloud = await AsyncStorageService.read(CLOUD_SETTINGS_KEY);
    this.useCloudData = useCloud === true;
  }
  
  static async getUseCloudData(): Promise<boolean> {
    return this.useCloudData;
  }
  
  static async setUseCloudData(value: boolean) {
    this.useCloudData = value;
    await AsyncStorageService.write(CLOUD_SETTINGS_KEY, value);
  }
  
  // Settings
  static async readSettings(key: string): Promise<any> {
    // Always read from AsyncStorage first
    const localData = await AsyncStorageService.read(key);
    
    // If cloud data is enabled, fetch from Supabase and override
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getSettings();
        if (cloudData) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch settings from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeSettings(key: string, value: any) {
    // Always save to AsyncStorage
    await AsyncStorageService.write(key, value);
    
    // If cloud data is enabled, also save to Supabase
    if (this.useCloudData) {
      try {
        await SupabaseService.updateSettings(value);
      } catch (error) {
        console.error('Failed to save settings to cloud:', error);
      }
    }
  }
  
  // Book Progress
  static async readBookProgress(key: string): Promise<any> {
    const localData = await AsyncStorageService.read(key);
    
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getBookProgress();
        // Use cloud data even if empty - empty is a valid state
        if (cloudData !== null && cloudData !== undefined) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch book progress from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeBookProgress(key: string, value: any) {
    await AsyncStorageService.write(key, value);
    
    if (this.useCloudData) {
      try {
        await SupabaseService.updateBookProgress(value);
      } catch (error) {
        console.error('Failed to save book progress to cloud:', error);
      }
    }
  }
  
  // Daily Plan
  static async readDailyPlan(key: string): Promise<any> {
    const localData = await AsyncStorageService.read(key);
    
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getDailyPlan();
        if (cloudData) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch daily plan from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeDailyPlan(key: string, value: any) {
    await AsyncStorageService.write(key, value);
    
    if (this.useCloudData && value) {
      try {
        await SupabaseService.saveDailyPlan(value);
      } catch (error) {
        console.error('Failed to save daily plan to cloud:', error);
      }
    }
  }
  
  // Book Track Sessions
  static async readBookTrackSessions(key: string): Promise<any> {
    const localData = await AsyncStorageService.read(key);
    
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getBookTrackSessions();
        // Use cloud data even if empty - empty is a valid state
        if (cloudData !== null && cloudData !== undefined) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch book track sessions from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeBookTrackSessions(key: string, value: any) {
    await AsyncStorageService.write(key, value);
    
    if (this.useCloudData && value && value.length > 0) {
      try {
        await SupabaseService.saveBookTrackSession(value);
      } catch (error) {
        console.error('Failed to save book track session to cloud:', error);
      }
    }
  }
  
  // No-Rep Words
  static async readNoRepWords(key: string): Promise<any> {
    const localData = await AsyncStorageService.read(key);
    
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getNoRepProgress('words');
        // Use cloud data even if empty - empty is a valid state
        if (cloudData !== null && cloudData !== undefined) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch no-rep words from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeNoRepWords(key: string, value: string[]) {
    await AsyncStorageService.write(key, value);
    
    if (this.useCloudData) {
      try {
        await SupabaseService.updateNoRepProgress('words', value);
      } catch (error) {
        console.error('Failed to save no-rep words to cloud:', error);
      }
    }
  }
  
  // No-Rep Sentences
  static async readNoRepSentences(key: string): Promise<any> {
    const localData = await AsyncStorageService.read(key);
    
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getNoRepProgress('sentences');
        // Use cloud data even if empty - empty is a valid state
        if (cloudData !== null && cloudData !== undefined) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch no-rep sentences from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeNoRepSentences(key: string, value: string[]) {
    await AsyncStorageService.write(key, value);
    
    if (this.useCloudData) {
      try {
        await SupabaseService.updateNoRepProgress('sentences', value);
      } catch (error) {
        console.error('Failed to save no-rep sentences to cloud:', error);
      }
    }
  }
  
  // No-Rep Word Completions
  static async readNoRepWordCompletions(key: string): Promise<any> {
    const localData = await AsyncStorageService.read(key);
    
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getNoRepCompletions('words');
        // Use cloud data even if empty - empty is a valid state
        if (cloudData !== null && cloudData !== undefined) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch no-rep word completions from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeNoRepWordCompletions(key: string, value: number[]) {
    await AsyncStorageService.write(key, value);
    
    if (this.useCloudData && value && value.length > 0) {
      try {
        await SupabaseService.saveNoRepCompletion('words');
      } catch (error) {
        console.error('Failed to save no-rep word completion to cloud:', error);
      }
    }
  }
  
  // No-Rep Sentence Completions
  static async readNoRepSentenceCompletions(key: string): Promise<any> {
    const localData = await AsyncStorageService.read(key);
    
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getNoRepCompletions('sentences');
        // Use cloud data even if empty - empty is a valid state
        if (cloudData !== null && cloudData !== undefined) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch no-rep sentence completions from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeNoRepSentenceCompletions(key: string, value: number[]) {
    await AsyncStorageService.write(key, value);
    
    if (this.useCloudData && value && value.length > 0) {
      try {
        await SupabaseService.saveNoRepCompletion('sentences');
      } catch (error) {
        console.error('Failed to save no-rep sentence completion to cloud:', error);
      }
    }
  }
  
  // Drawing Presentations
  static async readDrawingPresentations(key: string): Promise<any> {
    const localData = await AsyncStorageService.read(key);
    
    if (this.useCloudData) {
      try {
        const cloudData = await SupabaseService.getDrawingPresentations();
        // Use cloud data even if empty - empty is a valid state
        if (cloudData !== null && cloudData !== undefined) {
          return cloudData;
        }
      } catch (error) {
        console.error('Failed to fetch drawing presentations from cloud, using local data:', error);
      }
    }
    
    return localData;
  }
  
  static async writeDrawingPresentations(key: string, value: any[]) {
    await AsyncStorageService.write(key, value);
    
    if (this.useCloudData && value && value.length > 0) {
      try {
        await SupabaseService.saveDrawingPresentation(value);
      } catch (error) {
        console.error('Failed to save drawing presentation to cloud:', error);
      }
    }
  }
  
  // Generic clear (only clears local storage)
  static async clear(key: string) {
    await AsyncStorageService.clear(key);
  }
}