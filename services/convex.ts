import { ConvexReactClient } from 'convex/react';
import { isToday } from 'date-fns';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const functions = {
  usersCurrent: 'users:current',
  usersEnsureCurrentUser: 'users:ensureCurrentUser',
  usersUpdateProfile: 'users:updateProfile',
  settingsGet: 'settings:get',
  settingsUpsert: 'settings:upsert',
  booksListProgress: 'books:listProgress',
  booksReplaceProgress: 'books:replaceProgress',
  booksListTrackSessions: 'books:listTrackSessions',
  booksInsertTrackSession: 'books:insertTrackSession',
  booksGetLatestDailyPlan: 'books:getLatestDailyPlan',
  mathGetProgress: 'math:getProgress',
  mathUpsertProgress: 'math:upsertProgress',
  mathInsertSessionCompletion: 'math:insertSessionCompletion',
  equationsGetProgress: 'equations:getProgress',
  equationsUpsertProgress: 'equations:upsertProgress',
  equationsInsertSessionCompletion: 'equations:insertSessionCompletion',
  drawingsListPresentations: 'drawings:listPresentations',
  drawingsInsertPresentation: 'drawings:insertPresentation',
} as const;

let convexClient: ConvexReactClient | null = null;

type ContentType = 'words' | 'sentences';
type BookSession = 'session1' | 'session2' | 'session3';
type MathSession =
  | 'subitizingOrdered'
  | 'subitizingUnordered'
  | 'numbersOrdered'
  | 'numbersUnordered';
type EquationSession = 'subitizing1' | 'subitizing2' | 'equations1' | 'equations2';
type EquationCategory = 'integer' | 'fraction' | 'decimal' | 'negative' | 'percentage';

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

type AppUser = {
  _id: string;
  _creationTime: number;
  tokenIdentifier: string;
  email: string;
  name?: string;
  createdAt: number;
};

type BookProgress = {
  bookId: number;
  bookTitle: string;
  completedTriples: number[];
  progressTimestamp: number;
  isCompleted: boolean;
};

type BookTrackSession = {
  session: BookSession;
  type: ContentType;
  timestamp: number;
};

type MathProgress = {
  currentDay: number;
  lastSessionDate: string | null;
  completedSessions: MathSession[];
};

type MathSessionCompletion = {
  session: MathSession;
  day: number;
  timestamp?: number;
};

type EquationsProgress = {
  currentDay: number;
  currentCategory: EquationCategory;
  lastSessionDate: string | null;
  completedSessions: EquationSession[];
};

type EquationsSessionCompletion = {
  session: EquationSession;
  day: number;
  category: EquationCategory;
  timestamp?: number;
};

export class CloudConfigurationError extends Error {
  constructor() {
    super('Missing Convex configuration.');
    this.name = 'CloudConfigurationError';
  }
}

export class CloudOperationError extends Error {
  constructor(operation: string, cause?: unknown) {
    const details = cause instanceof Error ? cause.message : 'Unknown cloud error.';
    super(`Cloud operation failed while trying to ${operation}: ${details}`);
    this.name = 'CloudOperationError';
  }
}

export function getConvexClient(): ConvexReactClient {
  if (!convexUrl) {
    throw new CloudConfigurationError();
  }

  if (!convexClient) {
    convexClient = new ConvexReactClient(convexUrl);
  }

  return convexClient;
}

function buildCloudError(operation: string, cause: unknown): Error {
  if (cause instanceof CloudConfigurationError || cause instanceof CloudOperationError) {
    return cause;
  }

  return new CloudOperationError(operation, cause);
}

function handleCloudFailure(operation: string, cause: unknown): never {
  const error = buildCloudError(operation, cause);
  console.error(`Cloud operation failed (${operation}):`, cause);
  throw error;
}

export function ignoreCloudFailure() {
  // Background sync and optimistic mutations can safely ignore transport errors here.
}

// biome-ignore lint/complexity/noStaticOnlyClass: Static-only service aligns with app architecture
export class ConvexService {
  static validateConfiguration() {
    getConvexClient();
  }

  static async getCurrentUser(): Promise<AppUser | null> {
    try {
      return await getConvexClient().query(functions.usersCurrent as any, {});
    } catch (error) {
      handleCloudFailure('load account profile', error);
    }
  }

  static async ensureCurrentUser() {
    try {
      return await getConvexClient().mutation(functions.usersEnsureCurrentUser as any, {});
    } catch (error) {
      handleCloudFailure('initialize the current user', error);
    }
  }

  static async updateCurrentUserProfile(profile: { name: string }): Promise<AppUser> {
    try {
      return await getConvexClient().mutation(functions.usersUpdateProfile as any, profile);
    } catch (error) {
      handleCloudFailure('save account profile', error);
    }
  }

  static async getSettings(): Promise<SettingsSnapshot> {
    try {
      return await getConvexClient().query(functions.settingsGet as any, {});
    } catch (error) {
      handleCloudFailure('load settings', error);
    }
  }

  static async updateSettings(settings: SettingsSnapshot) {
    try {
      await getConvexClient().mutation(functions.settingsUpsert as any, {
        snapshot: settings,
      });
    } catch (error) {
      handleCloudFailure('save settings', error);
    }
  }

  static async getBookProgress(): Promise<BookProgress[]> {
    try {
      return await getConvexClient().query(functions.booksListProgress as any, {});
    } catch (error) {
      handleCloudFailure('load book progress', error);
    }
  }

  static async updateBookProgress(bookProgress: BookProgress[]) {
    try {
      await getConvexClient().mutation(functions.booksReplaceProgress as any, {
        progress: bookProgress,
      });
    } catch (error) {
      handleCloudFailure('save book progress', error);
    }
  }

  static async getBookTrackSessions(): Promise<BookTrackSession[]> {
    try {
      return await getConvexClient().query(functions.booksListTrackSessions as any, {});
    } catch (error) {
      handleCloudFailure('load reading session completions', error);
    }
  }

  static async saveBookTrackSession(sessions: BookTrackSession[]) {
    const lastSession = sessions[sessions.length - 1];
    if (!lastSession) {
      return;
    }

    try {
      await getConvexClient().mutation(functions.booksInsertTrackSession as any, lastSession);
    } catch (error) {
      handleCloudFailure('save reading session completion', error);
    }
  }

  static async getMathProgress(): Promise<MathProgress> {
    try {
      return await getConvexClient().query(functions.mathGetProgress as any, {});
    } catch (error) {
      handleCloudFailure('load math progress', error);
    }
  }

  static async updateMathProgress(progress: MathProgress) {
    try {
      await getConvexClient().mutation(functions.mathUpsertProgress as any, {
        progress,
      });
    } catch (error) {
      handleCloudFailure('save math progress', error);
    }
  }

  static async saveMathSessionCompletion(completionData: MathSessionCompletion) {
    try {
      await getConvexClient().mutation(functions.mathInsertSessionCompletion as any, {
        session: completionData.session,
        day: completionData.day,
        timestamp: completionData.timestamp ?? Date.now(),
      });
    } catch (error) {
      handleCloudFailure('save math session completion', error);
    }
  }

  static async getEquationsProgress(): Promise<EquationsProgress> {
    try {
      return await getConvexClient().query(functions.equationsGetProgress as any, {});
    } catch (error) {
      handleCloudFailure('load equations progress', error);
    }
  }

  static async updateEquationsProgress(progress: EquationsProgress) {
    try {
      await getConvexClient().mutation(functions.equationsUpsertProgress as any, {
        progress,
      });
    } catch (error) {
      handleCloudFailure('save equations progress', error);
    }
  }

  static async saveEquationsSessionCompletion(completionData: EquationsSessionCompletion) {
    try {
      await getConvexClient().mutation(functions.equationsInsertSessionCompletion as any, {
        session: completionData.session,
        day: completionData.day,
        category: completionData.category,
        timestamp: completionData.timestamp ?? Date.now(),
      });
    } catch (error) {
      handleCloudFailure('save equations session completion', error);
    }
  }

  static async getDrawingPresentations(): Promise<{ setTitle: string; timestamp: number }[]> {
    try {
      return await getConvexClient().query(functions.drawingsListPresentations as any, {});
    } catch (error) {
      handleCloudFailure('load drawing presentations', error);
    }
  }

  static async saveDrawingPresentation(presentations: { setTitle: string; timestamp: number }[]) {
    const lastPresentation = presentations[presentations.length - 1];
    if (!lastPresentation) {
      return;
    }

    try {
      await getConvexClient().mutation(
        functions.drawingsInsertPresentation as any,
        lastPresentation
      );
    } catch (error) {
      handleCloudFailure('save drawing presentation', error);
    }
  }

  static async getTodaysDailyPlan() {
    try {
      const plan = await getConvexClient().query(functions.booksGetLatestDailyPlan as any, {});

      if (!plan || !isToday(new Date(plan.timestamp))) {
        return null;
      }

      return plan;
    } catch (error) {
      handleCloudFailure("load today's reading plan", error);
    }
  }
}
