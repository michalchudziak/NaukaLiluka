import { AsyncStorageService } from '@/services/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'settings';

interface SettingsState {
  reading: {
    noRep: {
      words: number;
      sentences: number;
    };
    interval: {
      words: number;
      sentences: number;
    };
    books: {
      allowAllBooks: boolean;
    };
  };
  drawings: {
    showCaptions: boolean;
    interval: number;
  };
  
  updateReadingNoRepWords: (value: number) => void;
  updateReadingNoRepSentences: (value: number) => void;
  updateReadingIntervalWords: (value: number) => void;
  updateReadingIntervalSentences: (value: number) => void;
  updateReadingBooksAllowAll: (value: boolean) => void;
  updateDrawingsShowCaptions: (value: boolean) => void;
  updateDrawingsInterval: (value: number) => void;
  hydrate: () => Promise<void>;
}

const defaultSettings = {
  reading: {
    noRep: {
      words: 3,
      sentences: 3,
    },
    interval: {
      words: 1500,
      sentences: 2500,
    },
    books: {
      allowAllBooks: true,
    }
  },
  drawings: {
    showCaptions: true,
    interval: 1500,
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  
  updateReadingNoRepWords: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        reading: {
          ...state.reading,
          noRep: {
            ...state.reading.noRep,
            words: value
          }
        }
      };
      AsyncStorageService.write(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings
      });
      return newState;
    });
  },
  
  updateReadingNoRepSentences: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        reading: {
          ...state.reading,
          noRep: {
            ...state.reading.noRep,
            sentences: value
          }
        }
      };
      AsyncStorageService.write(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings
      });
      return newState;
    });
  },
  
  updateReadingIntervalWords: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        reading: {
          ...state.reading,
          interval: {
            ...state.reading.interval,
            words: value
          }
        }
      };
      AsyncStorageService.write(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings
      });
      return newState;
    });
  },
  
  updateReadingIntervalSentences: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        reading: {
          ...state.reading,
          interval: {
            ...state.reading.interval,
            sentences: value
          }
        }
      };
      AsyncStorageService.write(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings
      });
      return newState;
    });
  },
  
  updateReadingBooksAllowAll: (value: boolean) => {
    set((state) => {
      const newState = {
        ...state,
        reading: {
          ...state.reading,
          books: {
            ...state.reading.books,
            allowAllBooks: value
          }
        }
      };
      AsyncStorageService.write(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings
      });
      return newState;
    });
  },
  
  updateDrawingsShowCaptions: (value: boolean) => {
    set((state) => {
      const newState = {
        ...state,
        drawings: {
          ...state.drawings,
          showCaptions: value
        }
      };
      AsyncStorageService.write(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings
      });
      return newState;
    });
  },
  
  updateDrawingsInterval: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        drawings: {
          ...state.drawings,
          interval: value
        }
      };
      AsyncStorageService.write(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings
      });
      return newState;
    });
  },
  
  hydrate: async () => {
    const stored = await AsyncStorageService.read(STORAGE_KEY);
    if (stored) {
      set({
        reading: stored.reading || defaultSettings.reading,
        drawings: stored.drawings || defaultSettings.drawings
      });
    }
  }
}));