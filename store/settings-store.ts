import { create } from 'zustand';
import { ConvexService, ignoreCloudFailure } from '@/services/convex';

type SettingsSnapshot = {
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
    showFacts: boolean;
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
};

interface SettingsState extends SettingsSnapshot {
  updateReadingNoRepWords: (value: number) => void;
  updateReadingNoRepSentences: (value: number) => void;
  updateReadingIntervalWords: (value: number) => void;
  updateReadingIntervalSentences: (value: number) => void;
  updateReadingBooksAllowAll: (value: boolean) => void;
  updateReadingWordSpacing: (value: number) => void;
  updateDrawingsShowCaptions: (value: boolean) => void;
  updateDrawingsShowFacts: (value: boolean) => void;
  updateDrawingsInterval: (value: number) => void;
  updateDrawingsRandomOrder: (value: boolean) => void;
  updateMathEquationsInterval: (value: number) => void;
  updateMathEquationsCount: (value: number) => void;
  updateMathNumbersInterval: (value: number) => void;
  updateMathNumbersCount: (value: number) => void;
  bootstrap: () => Promise<void>;
}

const defaultSettings: SettingsSnapshot = {
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
    showFacts: false,
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
};

function mergeSettings(stored: Partial<SettingsSnapshot> | null | undefined): SettingsSnapshot {
  if (!stored) {
    return defaultSettings;
  }

  return {
    reading: {
      ...defaultSettings.reading,
      ...stored.reading,
      noRep: {
        ...defaultSettings.reading.noRep,
        ...(stored.reading?.noRep ?? {}),
      },
      interval: {
        ...defaultSettings.reading.interval,
        ...(stored.reading?.interval ?? {}),
      },
      books: {
        ...defaultSettings.reading.books,
        ...(stored.reading?.books ?? {}),
      },
    },
    drawings: {
      ...defaultSettings.drawings,
      ...(stored.drawings ?? {}),
    },
    math: {
      ...defaultSettings.math,
      ...stored.math,
      equations: {
        ...defaultSettings.math.equations,
        ...(stored.math?.equations ?? {}),
      },
      numbers: {
        ...defaultSettings.math.numbers,
        ...(stored.math?.numbers ?? {}),
      },
    },
  };
}

function persistSettings(snapshot: SettingsSnapshot) {
  void ConvexService.updateSettings(snapshot).catch(ignoreCloudFailure);
}

export const useSettingsStore = create<SettingsState>((set) => ({
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
      persistSettings(newState);
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
      persistSettings(newState);
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
      persistSettings(newState);
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
      persistSettings(newState);
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
      persistSettings(newState);
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
      persistSettings(newState);
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
      persistSettings(newState);
      return newState;
    });
  },

  updateDrawingsShowFacts: (value: boolean) => {
    set((state) => {
      const newState = {
        ...state,
        drawings: {
          ...state.drawings,
          showFacts: value,
        },
      };
      persistSettings(newState);
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
      persistSettings(newState);
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
      persistSettings(newState);
      return newState;
    });
  },

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
      persistSettings(newState);
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
      persistSettings(newState);
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
      persistSettings(newState);
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
      persistSettings(newState);
      return newState;
    });
  },

  bootstrap: async () => {
    const stored = await ConvexService.getSettings();
    set(mergeSettings(stored));
  },
}));
