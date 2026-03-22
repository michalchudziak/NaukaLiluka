import { v } from 'convex/values';
import { defaultSettings } from './settingsSnapshot';

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
  name: v.optional(v.string()),
  createdAt: v.number(),
});

export const drawingStatusValidator = v.object({
  completedToday: v.boolean(),
  completedSetTitle: v.union(v.string(), v.null()),
  completedAt: v.union(v.number(), v.null()),
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
