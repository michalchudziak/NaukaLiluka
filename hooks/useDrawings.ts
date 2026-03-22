import { useMutation, useQuery } from 'convex/react';
import { startOfDay } from 'date-fns';
import { api } from '@/convex/_generated/api';

export function useDrawingsStatus() {
  const todayStartMs = startOfDay(new Date()).getTime();
  return useQuery(api.drawings.getTodayStatus, { todayStartMs });
}

export function useCompleteDrawingSession() {
  return useMutation(api.drawings.completeSession);
}
