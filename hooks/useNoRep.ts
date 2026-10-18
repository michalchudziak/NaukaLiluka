import { useConvex, useQuery } from 'convex/react';
import { startOfDay } from 'date-fns';
import { api } from '@/convex/_generated/api';

export function useNoRepStatus() {
  const todayStartMs = startOfDay(new Date()).getTime();
  return useQuery(api.noRep.getStatus, { todayStartMs });
}

export function useChooseNoRepItems() {
  const convex = useConvex();
  return (args: { contentType: 'words' | 'sentences' }) => convex.query(api.noRep.choose, args);
}
