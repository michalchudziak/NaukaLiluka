import { v } from 'convex/values';

export const contentTypeValidator = v.union(v.literal('words'), v.literal('sentences'));

export const bookSessionNameValidator = v.union(
  v.literal('session1'),
  v.literal('session2'),
  v.literal('session3')
);

export const mathSessionValidator = v.union(
  v.literal('subitizingOrdered'),
  v.literal('subitizingUnordered'),
  v.literal('numbersOrdered'),
  v.literal('numbersUnordered')
);

export const equationSessionValidator = v.union(
  v.literal('subitizing1'),
  v.literal('subitizing2'),
  v.literal('equations1'),
  v.literal('equations2')
);

export const equationCategoryValidator = v.union(
  v.literal('integer'),
  v.literal('fraction'),
  v.literal('decimal'),
  v.literal('negative'),
  v.literal('percentage')
);

export const settingsSnapshotValidator = v.object({
  reading: v.object({
    noRep: v.object({
      words: v.number(),
      sentences: v.number(),
    }),
    interval: v.object({
      words: v.number(),
      sentences: v.number(),
    }),
    books: v.object({
      allowAllBooks: v.boolean(),
    }),
    wordSpacing: v.number(),
  }),
  drawings: v.object({
    showCaptions: v.boolean(),
    interval: v.number(),
    randomOrder: v.boolean(),
    showFacts: v.boolean(),
  }),
  math: v.object({
    equations: v.object({
      interval: v.number(),
      equationCount: v.number(),
    }),
    numbers: v.object({
      interval: v.number(),
      numberCount: v.number(),
    }),
  }),
});

export const appUserValidator = v.object({
  _id: v.id('users'),
  _creationTime: v.number(),
  tokenIdentifier: v.string(),
  email: v.string(),
  createdAt: v.number(),
});

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
} as const;

export const bookProgressValidator = v.object({
  bookId: v.number(),
  bookTitle: v.string(),
  completedTriples: v.array(v.number()),
  progressTimestamp: v.number(),
  isCompleted: v.boolean(),
});

export const bookTrackSessionValidator = v.object({
  session: bookSessionNameValidator,
  type: contentTypeValidator,
  timestamp: v.number(),
});

export const drawingPresentationValidator = v.object({
  setTitle: v.string(),
  timestamp: v.number(),
});

export const mathProgressValidator = v.object({
  currentDay: v.number(),
  lastSessionDate: v.union(v.string(), v.null()),
  completedSessions: v.array(mathSessionValidator),
});

export const defaultMathProgress = {
  currentDay: 1,
  lastSessionDate: null,
  completedSessions: [] as Array<
    'subitizingOrdered' | 'subitizingUnordered' | 'numbersOrdered' | 'numbersUnordered'
  >,
};

export const mathSessionCompletionValidator = v.object({
  session: mathSessionValidator,
  day: v.number(),
  timestamp: v.number(),
});

export const equationsProgressValidator = v.object({
  currentDay: v.number(),
  currentCategory: equationCategoryValidator,
  lastSessionDate: v.union(v.string(), v.null()),
  completedSessions: v.array(equationSessionValidator),
});

export const defaultEquationsProgress = {
  currentDay: 1,
  currentCategory: 'integer',
  lastSessionDate: null,
  completedSessions: [] as Array<'subitizing1' | 'subitizing2' | 'equations1' | 'equations2'>,
};

export const equationsSessionCompletionValidator = v.object({
  session: equationSessionValidator,
  day: v.number(),
  category: equationCategoryValidator,
  timestamp: v.number(),
});

export const bookDailySessionContentValidator = v.object({
  words: v.array(v.string()),
  sentences: v.array(v.string()),
  isWordsCompleted: v.boolean(),
  isSentencesCompleted: v.boolean(),
});

export const bookDailyPlanValidator = v.object({
  timestamp: v.number(),
  bookId: v.string(),
  selectedWordTripleIndex: v.number(),
  selectedSentenceTripleIndex: v.number(),
  sessions: v.object({
    session1: bookDailySessionContentValidator,
    session2: bookDailySessionContentValidator,
    session3: bookDailySessionContentValidator,
  }),
});
