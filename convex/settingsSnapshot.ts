export type SettingsSnapshot = {
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

export type ReadingNoRepPatch = Partial<SettingsSnapshot['reading']['noRep']>;
export type ReadingIntervalPatch = Partial<SettingsSnapshot['reading']['interval']>;
export type ReadingBooksPatch = Partial<SettingsSnapshot['reading']['books']>;
export type DrawingsPatch = Partial<SettingsSnapshot['drawings']>;
export type MathEquationsPatch = Partial<SettingsSnapshot['math']['equations']>;
export type MathNumbersPatch = Partial<SettingsSnapshot['math']['numbers']>;

export const defaultSettings = {
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
} satisfies SettingsSnapshot;

export function applyReadingNoRepPatch(
  settings: SettingsSnapshot,
  patch: ReadingNoRepPatch
): SettingsSnapshot {
  return {
    ...settings,
    reading: {
      ...settings.reading,
      noRep: {
        ...settings.reading.noRep,
        ...patch,
      },
    },
  };
}

export function applyReadingIntervalPatch(
  settings: SettingsSnapshot,
  patch: ReadingIntervalPatch
): SettingsSnapshot {
  return {
    ...settings,
    reading: {
      ...settings.reading,
      interval: {
        ...settings.reading.interval,
        ...patch,
      },
    },
  };
}

export function applyReadingBooksPatch(
  settings: SettingsSnapshot,
  patch: ReadingBooksPatch
): SettingsSnapshot {
  return {
    ...settings,
    reading: {
      ...settings.reading,
      books: {
        ...settings.reading.books,
        ...patch,
      },
    },
  };
}

export function applyReadingWordSpacingPatch(
  settings: SettingsSnapshot,
  wordSpacing: number
): SettingsSnapshot {
  return {
    ...settings,
    reading: {
      ...settings.reading,
      wordSpacing,
    },
  };
}

export function applyDrawingsPatch(
  settings: SettingsSnapshot,
  patch: DrawingsPatch
): SettingsSnapshot {
  return {
    ...settings,
    drawings: {
      ...settings.drawings,
      ...patch,
    },
  };
}

export function applyMathEquationsPatch(
  settings: SettingsSnapshot,
  patch: MathEquationsPatch
): SettingsSnapshot {
  return {
    ...settings,
    math: {
      ...settings.math,
      equations: {
        ...settings.math.equations,
        ...patch,
      },
    },
  };
}

export function applyMathNumbersPatch(
  settings: SettingsSnapshot,
  patch: MathNumbersPatch
): SettingsSnapshot {
  return {
    ...settings,
    math: {
      ...settings.math,
      numbers: {
        ...settings.math.numbers,
        ...patch,
      },
    },
  };
}
