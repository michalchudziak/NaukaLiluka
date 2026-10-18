import { useMutation, useQuery } from 'convex/react';
import { startOfDay } from 'date-fns';
import { api } from '@/convex/_generated/api';
import type { RoutineBlockId } from '@/shared/dailyCommitment';

export function useRoutinePlan() {
  const todayStartMs = startOfDay(new Date()).getTime();
  const plan = useQuery(api.routineCycle.getTodayPlan, { todayStartMs });
  const activeBlockIds = (plan?.activeBlockIds ?? []) as RoutineBlockId[];

  return {
    plan,
    activeBlockIds,
    commitmentMinutes: plan?.commitmentMinutes ?? null,
    sameDayProgressRequired: plan?.sameDayProgressRequired ?? false,
    isLoaded: plan !== undefined,
    isRoutineActive: (blockId: RoutineBlockId) =>
      plan !== undefined && activeBlockIds.includes(blockId),
  };
}

export function useSyncRoutineCycle() {
  const todayStartMs = startOfDay(new Date()).getTime();
  const syncTodayCompletion = useMutation(api.routineCycle.syncTodayCompletion);

  return () => syncTodayCompletion({ todayStartMs });
}
