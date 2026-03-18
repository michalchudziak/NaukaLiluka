import { useMutation, useQuery } from 'convex/react';
import { startOfDay } from 'date-fns';
import { api } from '@/convex/_generated/api';

export function useNoRepStatus() {
  const todayStartMs = startOfDay(new Date()).getTime();
  return useQuery(api.noRep.getStatus, { todayStartMs });
}

export function useChooseAndMark() {
  return useMutation(api.noRep.chooseAndMark);
}
