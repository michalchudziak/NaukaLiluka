import { useMutation, useQuery } from 'convex/react';
import { startOfDay } from 'date-fns';
import { api } from '@/convex/_generated/api';
import { useRoutinePlan, useSyncRoutineCycle } from '@/hooks/useRoutinePlan';

export function useDrawingsStatus() {
  const todayStartMs = startOfDay(new Date()).getTime();
  return useQuery(api.drawings.getTodayStatus, { todayStartMs });
}

export function useCompleteDrawingSession() {
  const mutate = useMutation(api.drawings.completeSession);
  const { isRoutineActive } = useRoutinePlan();
  const syncRoutineCycle = useSyncRoutineCycle();

  return async (args: { setTitle: string; todayStartMs: number }) => {
    if (!isRoutineActive('drawings')) {
      return null;
    }

    const result = await mutate(args);
    await syncRoutineCycle();
    return result;
  };
}
