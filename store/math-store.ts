import { isSameDay, isToday, parseISO } from 'date-fns';
import { create } from 'zustand';
import {
  type DailyData,
  getNumbersLearningScheme,
  type SessionContent,
} from '@/content/math/learning-scheme';
import { SupabaseService } from '@/services/supabase';
import { useSettingsStore } from './settings-store';

type Session = 'subitizingOrdered' | 'subitizingUnordered' | 'numbersOrdered' | 'numbersUnordered';

interface MathStore {
  currentDay: number;
  lastSessionDate: string | null;
  completedSessions: Session[];

  getDailyData: () => DailyData;
  markSessionCompleted: (session: Session) => Promise<void>;
  isDayCompleted: () => boolean;
  isSessionCompletedToday: (session: 'session1' | 'session2') => boolean;
  maybeAdvanceTheDay: () => Promise<void>;
  bootstrap: () => Promise<void>;
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
    const count = useSettingsStore.getState().math.numbers.numberCount || 10;
    return getNumbersLearningScheme(currentDay, count);
  },

  markSessionCompleted: async (session) => {
    const today = new Date().toISOString();
    const { lastSessionDate, completedSessions, currentDay } = get();

    let newState: Partial<MathStore> | undefined;
    if (!lastSessionDate || !isSameDay(parseISO(lastSessionDate), new Date())) {
      newState = {
        lastSessionDate: today,
        completedSessions: [session],
      };
    } else {
      if (!completedSessions.includes(session)) {
        newState = {
          completedSessions: [...completedSessions, session],
        };
      } else {
        return; // Session already completed
      }
    }

    set(newState);

    const updatedState = { ...get() };
    await SupabaseService.updateMathProgress({
      currentDay: updatedState.currentDay,
      lastSessionDate: updatedState.lastSessionDate,
      completedSessions: updatedState.completedSessions,
    });

    await SupabaseService.saveMathSessionCompletion({
      session,
      day: currentDay,
      timestamp: Date.now(),
    });
  },

  isDayCompleted: () => {
    const { currentDay, completedSessions, lastSessionDate } = get();

    if (!lastSessionDate || !isToday(parseISO(lastSessionDate))) {
      return false;
    }

    const count = useSettingsStore.getState().math.numbers.numberCount || 10;
    const dailyData = getNumbersLearningScheme(currentDay, count);
    const allSessions = dailyData.sessionContent.flat();
    const requiredSessions = allSessions.map(sessionContentToSession);

    return requiredSessions.every((session) => completedSessions.includes(session));
  },

  isSessionCompletedToday: (session) => {
    const { currentDay, completedSessions, lastSessionDate } = get();

    if (!lastSessionDate || !isToday(parseISO(lastSessionDate))) {
      return false;
    }

    const count = useSettingsStore.getState().math.numbers.numberCount || 10;
    const dailyData = getNumbersLearningScheme(currentDay, count);
    const sessionIndex = session === 'session1' ? 0 : 1;

    if (sessionIndex >= dailyData.sessionContent.length) {
      return false;
    }

    const sessionContents = dailyData.sessionContent[sessionIndex];
    const requiredSessions = sessionContents.map(sessionContentToSession);

    return requiredSessions.every((s) => completedSessions.includes(s));
  },

  maybeAdvanceTheDay: async () => {
    const { currentDay, lastSessionDate, completedSessions } = get();

    if (!lastSessionDate) {
      return;
    }

    const lastSession = parseISO(lastSessionDate);

    if (isToday(lastSession)) {
      return;
    }

    // If last session was any day before today
    const count = useSettingsStore.getState().math.numbers.numberCount || 10;
    const dailyData = getNumbersLearningScheme(currentDay, count);
    const allSessions = dailyData.sessionContent.flat();
    const requiredSessions = allSessions.map(sessionContentToSession);

    const allSessionsCompleted = requiredSessions.every((session) =>
      completedSessions.includes(session)
    );

    if (allSessionsCompleted) {
      const newState = {
        currentDay: currentDay + 1,
        completedSessions: [],
      };
      set(newState);

      const updatedState = { ...get() };
      await SupabaseService.updateMathProgress({
        currentDay: updatedState.currentDay,
        lastSessionDate: updatedState.lastSessionDate,
        completedSessions: updatedState.completedSessions,
      });
    }
  },

  bootstrap: async () => {
    const mathProgress = await SupabaseService.getMathProgress();

    if (mathProgress) {
      set({
        currentDay: mathProgress.currentDay || 1,
        lastSessionDate: mathProgress.lastSessionDate || null,
        completedSessions: mathProgress.completedSessions || [],
      });
    }

    await get().maybeAdvanceTheDay();
  },
}));
