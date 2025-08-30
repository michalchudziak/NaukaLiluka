import { isSameDay, isToday, parseISO } from 'date-fns';
import { create } from 'zustand';
import {
  type DailyData,
  getNumbersLearningScheme,
  type SessionContent,
} from '@/content/math/learning-scheme';

const STORAGE_KEYS = {
  MATH_PROGRESS: 'progress.math',
  MATH_SESSION_COMPLETIONS: 'routines.math.sessions',
} as const;

type Session = 'subitizingOrdered' | 'subitizingUnordered' | 'numbersOrdered' | 'numbersUnordered';

interface MathStore {
  currentDay: number;
  lastSessionDate: string | null;
  completedSessions: Session[];

  getDailyData: () => DailyData;
  markSessionCompleted: (session: Session) => void;
  isDayCompleted: () => boolean;
  isSessionCompletedToday: (session: 'session1' | 'session2') => boolean;
  hydrate: () => Promise<void>;
}

const sessionContentToSession = (content: SessionContent): Session => {
  const ordered = content.isOrdered ? 'Ordered' : 'Unordered';
  const type = content.type === 'subitizing' ? 'subitizing' : 'numbers';
  return `${type}${ordered}` as Session;
};

export const useMathStore = create<MathStore>((set, get) => ({
  currentDay: 1,
  lastSessionDate: null,
  completedSessions: [],

  getDailyData: () => {
    const { currentDay } = get();
    return getNumbersLearningScheme(currentDay);
  },

  markSessionCompleted: (session) => {
    const today = new Date().toISOString();
    const { lastSessionDate, completedSessions } = get();

    if (!lastSessionDate || !isSameDay(parseISO(lastSessionDate), new Date())) {
      set({
        lastSessionDate: today,
        completedSessions: [session],
      });
    } else {
      if (!completedSessions.includes(session)) {
        set({
          completedSessions: [...completedSessions, session],
        });
      }
    }
  },

  isDayCompleted: () => {
    const { currentDay, completedSessions, lastSessionDate } = get();

    if (!lastSessionDate || !isToday(parseISO(lastSessionDate))) {
      return false;
    }

    const dailyData = getNumbersLearningScheme(currentDay);
    const allSessions = dailyData.sessionContent.flat();
    const requiredSessions = allSessions.map(sessionContentToSession);

    return requiredSessions.every((session) => completedSessions.includes(session));
  },

  isSessionCompletedToday: (session) => {
    const { currentDay, completedSessions, lastSessionDate } = get();

    if (!lastSessionDate || !isToday(parseISO(lastSessionDate))) {
      return false;
    }

    const dailyData = getNumbersLearningScheme(currentDay);
    const sessionIndex = session === 'session1' ? 0 : 1;

    if (sessionIndex >= dailyData.sessionContent.length) {
      return false;
    }

    const sessionContents = dailyData.sessionContent[sessionIndex];
    const requiredSessions = sessionContents.map(sessionContentToSession);

    return requiredSessions.every((s) => completedSessions.includes(s));
  },

  hydrate: async () => {
    // TODO: Implement hydration from hybrid store later
  },
}));
