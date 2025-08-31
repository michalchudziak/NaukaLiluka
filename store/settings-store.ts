import { create } from 'zustand';
import { HybridStorageService } from '@/services/hybrid-storage';

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
    wordSpacing: number;
  };
  drawings: {
    showCaptions: boolean;
    interval: number;
    randomOrder: boolean;
  };
  math: {
    equations: {
      interval: number;
      equationCount: number;
    };
    numbers: {
      interval: number;
      numberCount: number;
    };
  };
  useCloudData: boolean;

  updateReadingNoRepWords: (value: number) => void;
  updateReadingNoRepSentences: (value: number) => void;
  updateReadingIntervalWords: (value: number) => void;
  updateReadingIntervalSentences: (value: number) => void;
  updateReadingBooksAllowAll: (value: boolean) => void;
  updateReadingWordSpacing: (value: number) => void;
  updateDrawingsShowCaptions: (value: boolean) => void;
  updateDrawingsInterval: (value: number) => void;
  updateDrawingsRandomOrder: (value: boolean) => void;
  updateUseCloudData: (value: boolean) => void;
  updateMathEquationsInterval: (value: number) => void;
  updateMathEquationsCount: (value: number) => void;
  updateMathNumbersInterval: (value: number) => void;
  updateMathNumbersCount: (value: number) => void;
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
    },
    wordSpacing: 1,
  },
  drawings: {
    showCaptions: true,
    interval: 1500,
    randomOrder: false,
  },
  math: {
    equations: {
      interval: 1500,
      equationCount: 5,
    },
    numbers: {
      interval: 1000,
      numberCount: 10,
    },
  },
  useCloudData: false,
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
            words: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
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
            sentences: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
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
            words: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
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
            sentences: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
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
            allowAllBooks: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
      });
      return newState;
    });
  },

  updateReadingWordSpacing: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        reading: {
          ...state.reading,
          wordSpacing: value,
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
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
          showCaptions: value,
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
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
          interval: value,
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
      });
      return newState;
    });
  },

  updateDrawingsRandomOrder: (value: boolean) => {
    set((state) => {
      const newState = {
        ...state,
        drawings: {
          ...state.drawings,
          randomOrder: value,
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
      });
      return newState;
    });
  },

  updateUseCloudData: async (value: boolean) => {
    await HybridStorageService.setUseCloudData(value);
    set({ useCloudData: value });
    // Re-hydrate from cloud if enabled
    if (value) {
      get().hydrate();
    }
  },

  // Math settings updaters
  updateMathEquationsInterval: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        math: {
          ...state.math,
          equations: {
            ...state.math.equations,
            interval: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
      });
      return newState;
    });
  },

  updateMathEquationsCount: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        math: {
          ...state.math,
          equations: {
            ...state.math.equations,
            equationCount: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
      });
      return newState;
    });
  },

  updateMathNumbersInterval: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        math: {
          ...state.math,
          numbers: {
            ...state.math.numbers,
            interval: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
      });
      return newState;
    });
  },

  updateMathNumbersCount: (value: number) => {
    set((state) => {
      const newState = {
        ...state,
        math: {
          ...state.math,
          numbers: {
            ...state.math.numbers,
            numberCount: value,
          },
        },
      };
      HybridStorageService.writeSettings(STORAGE_KEY, {
        reading: newState.reading,
        drawings: newState.drawings,
        math: newState.math,
      });
      return newState;
    });
  },

  hydrate: async () => {
    await HybridStorageService.initialize();
    const useCloudData = await HybridStorageService.getUseCloudData();
    const stored = await HybridStorageService.readSettings(STORAGE_KEY);
    if (stored) {
      set({
        reading: stored.reading || defaultSettings.reading,
        drawings: stored.drawings || defaultSettings.drawings,
        math: stored.math || defaultSettings.math,
        useCloudData,
      });
    } else {
      set({ useCloudData });
    }
  },
}));
