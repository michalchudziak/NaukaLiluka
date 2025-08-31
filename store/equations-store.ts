import { isSameDay, isToday, parseISO } from 'date-fns';
import { create } from 'zustand';
import { buildEquationScheme, type DailyData } from '@/content/math/equation-scheme';
import { HybridStorageService } from '@/services/hybrid-storage';

type Session = 'subitizing1' | 'subitizing2' | 'equations1' | 'equations2';

type Category = 'integer' | 'fraction' | 'decimal' | 'negative' | 'percentage';

interface EquationsStore {
  currentDay: number;
  currentCategory: Category;
  lastSessionDate: string | null;
  completedSessions: Session[];

  getDailyData: () => DailyData;
  markSessionCompleted: (session: Session) => Promise<void>;
  isDayCompleted: () => boolean;
  isSessionCompletedToday: (session: 'session1' | 'session2') => boolean;
  maybeAdvanceTheDay: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const STORAGE_KEYS = {
  EQUATIONS_PROGRESS: 'progress.equations',
  EQUATIONS_SESSION_COMPLETIONS: 'routines.equations.sessions',
} as const;

const CATEGORY_ORDER: Category[] = ['integer', 'fraction', 'decimal', 'negative', 'percentage'];
const CATEGORY_DURATIONS: Record<Category, number> = {
  integer: 5,
  fraction: 6,
  decimal: 6,
  negative: 6,
  percentage: 6,
};

const nextDayAndCategory = (
  day: number,
  category: Category
): { day: number; category: Category } => {
  const maxDays = CATEGORY_DURATIONS[category];
  if (day < maxDays) {
    return { day: day + 1, category };
  }
  const idx = CATEGORY_ORDER.indexOf(category);
  const nextCategory = CATEGORY_ORDER[(idx + 1) % CATEGORY_ORDER.length];
  return { day: 1, category: nextCategory };
};

const contentToSessionToken = (
  content: 'subitizing' | 'equations',
  sessionIndex: number
): Session => {
  const suffix = sessionIndex === 0 ? '1' : '2';
  return `${content}${suffix}` as Session;
};

export const useEquationsStore = create<EquationsStore>((set, get) => ({
  currentDay: 1,
  currentCategory: 'integer',
  lastSessionDate: null,
  completedSessions: [],

  getDailyData: () => {
    const { currentDay, currentCategory } = get();
    // numberLimit and count kept simple and constant for now
    return buildEquationScheme(currentDay, 100, 12, currentCategory);
  },

  markSessionCompleted: async (session) => {
    const todayIso = new Date().toISOString();
    const { lastSessionDate, completedSessions, currentDay, currentCategory } = get();

    let newState: Partial<EquationsStore> | undefined;
    if (!lastSessionDate || !isSameDay(parseISO(lastSessionDate), new Date())) {
      newState = {
        lastSessionDate: todayIso,
        completedSessions: [session],
      };
    } else {
      if (!completedSessions.includes(session)) {
        newState = {
          completedSessions: [...completedSessions, session],
        };
      } else {
        return; // already completed
      }
    }

    if (newState) set(newState as any);

    const updated = { ...get() };
    await HybridStorageService.writeEquationsProgress(STORAGE_KEYS.EQUATIONS_PROGRESS, {
      currentDay: updated.currentDay,
      currentCategory: updated.currentCategory,
      lastSessionDate: updated.lastSessionDate,
      completedSessions: updated.completedSessions,
    });

    await HybridStorageService.writeEquationsSessionCompletions(
      STORAGE_KEYS.EQUATIONS_SESSION_COMPLETIONS,
      {
        session,
        day: currentDay,
        category: currentCategory,
        timestamp: Date.now(),
      }
    );
  },

  isDayCompleted: () => {
    const { lastSessionDate, completedSessions } = get();
    if (!lastSessionDate || !isToday(parseISO(lastSessionDate))) return false;

    const daily = get().getDailyData();
    const requiredTokens = daily.sessionContent.flatMap((sessionContents, idx) =>
      sessionContents.map((c) => contentToSessionToken(c, idx))
    );
    return requiredTokens.every((t) => completedSessions.includes(t));
  },

  isSessionCompletedToday: (session) => {
    const { lastSessionDate, completedSessions } = get();
    if (!lastSessionDate || !isToday(parseISO(lastSessionDate))) return false;

    const daily = get().getDailyData();
    const sessionIndex = session === 'session1' ? 0 : 1;
    if (sessionIndex >= daily.sessionContent.length) return false;

    const tokens = daily.sessionContent[sessionIndex].map((c) =>
      contentToSessionToken(c, sessionIndex)
    );
    return tokens.every((t) => completedSessions.includes(t));
  },

  maybeAdvanceTheDay: async () => {
    const { currentDay, currentCategory, lastSessionDate, completedSessions } = get();
    if (!lastSessionDate) return;
    if (isToday(parseISO(lastSessionDate))) return;

    const daily = get().getDailyData();
    const requiredTokens = daily.sessionContent.flatMap((sessionContents, idx) =>
      sessionContents.map((c) => contentToSessionToken(c, idx))
    );
    const allCompleted = requiredTokens.every((t) => completedSessions.includes(t));
    if (!allCompleted) return;

    const next = nextDayAndCategory(currentDay, currentCategory);
    set({ currentDay: next.day, currentCategory: next.category, completedSessions: [] });

    const updated = { ...get() };
    await HybridStorageService.writeEquationsProgress(STORAGE_KEYS.EQUATIONS_PROGRESS, {
      currentDay: updated.currentDay,
      currentCategory: updated.currentCategory,
      lastSessionDate: updated.lastSessionDate,
      completedSessions: updated.completedSessions,
    });
  },

  hydrate: async () => {
    await HybridStorageService.initialize();
    const eqProgress = await HybridStorageService.readEquationsProgress(
      STORAGE_KEYS.EQUATIONS_PROGRESS
    );
    if (eqProgress) {
      set({
        currentDay: eqProgress.currentDay || 1,
        currentCategory: eqProgress.currentCategory || 'integer',
        lastSessionDate: eqProgress.lastSessionDate || null,
        completedSessions: eqProgress.completedSessions || [],
      });
    }
    await get().maybeAdvanceTheDay();
  },
}));
