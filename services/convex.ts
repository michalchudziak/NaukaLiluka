import { ConvexReactClient } from 'convex/react';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const functions = {
  usersCurrent: 'users:current',
  usersEnsureCurrentUser: 'users:ensureCurrentUser',
  usersUpdateProfile: 'users:updateProfile',
  settingsGet: 'settings:get',
  settingsUpsert: 'settings:upsert',
  mathGetProgress: 'math:getProgress',
  mathUpsertProgress: 'math:upsertProgress',
  mathInsertSessionCompletion: 'math:insertSessionCompletion',
  equationsGetProgress: 'equations:getProgress',
  equationsUpsertProgress: 'equations:upsertProgress',
  equationsInsertSessionCompletion: 'equations:insertSessionCompletion',
} as const;

let convexClient: ConvexReactClient | null = null;

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
}
