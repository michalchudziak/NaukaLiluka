import { useMutation, useQuery } from 'convex/react';
import { startOfDay } from 'date-fns';
import { buildEquationScheme } from '@/content/math/equation-scheme';
import { getNumbersLearningScheme } from '@/content/math/learning-scheme';
import { api } from '@/convex/_generated/api';
import { useSettingsStore } from '@/store/settings-store';

export type MathSession =
  | 'subitizingOrdered'
  | 'subitizingUnordered'
  | 'numbersOrdered'
  | 'numbersUnordered';

export type EquationSession = 'subitizing1' | 'subitizing2' | 'equations1' | 'equations2';
export type EquationCategory = 'integer' | 'fraction' | 'decimal' | 'negative' | 'percentage';

export function useMathStatus() {
  const todayStartMs = startOfDay(new Date()).getTime();
  const status = useQuery(api.math.getStatus, { todayStartMs });
  const numberCount = useSettingsStore((state) => state.math.numbers.numberCount);
  const currentDay = status?.currentDay ?? 1;

  return {
    status,
    currentDay,
    dailyData: getNumbersLearningScheme(currentDay, numberCount || 10),
    completedSessionsToday: status?.completedSessionsToday ?? [],
    hasGraduatedToEquations: status?.hasGraduatedToEquations ?? currentDay > 30,
    isDayCompleted: status?.isDayCompleted ?? false,
    isSessionCompletedToday: (session: 'session1' | 'session2') =>
      status?.sessions[session] ?? false,
  };
}

export function useCompleteMathSession() {
  const todayStartMs = startOfDay(new Date()).getTime();
  const mutate = useMutation(api.math.completeSession);

  return (session: MathSession) =>
    mutate({
      session,
      todayStartMs,
    });
}

export function useEquationsStatus() {
  const todayStartMs = startOfDay(new Date()).getTime();
  const status = useQuery(api.equations.getStatus, { todayStartMs });
  const equationCount = useSettingsStore((state) => state.math.equations.equationCount);
  const currentDay = status?.currentDay ?? 1;
  const currentCategory = status?.currentCategory ?? 'integer';

  return {
    status,
    currentDay,
    currentCategory,
    dailyData: buildEquationScheme(currentDay, 100, equationCount || 5, currentCategory),
    completedSessionsToday: status?.completedSessionsToday ?? [],
    isDayCompleted: status?.isDayCompleted ?? false,
    isSessionCompletedToday: (session: 'session1' | 'session2') =>
      status?.sessions[session] ?? false,
  };
}

export function useCompleteEquationSession() {
  const todayStartMs = startOfDay(new Date()).getTime();
  const mutate = useMutation(api.equations.completeSession);

  return (session: EquationSession) =>
    mutate({
      session,
      todayStartMs,
    });
}
