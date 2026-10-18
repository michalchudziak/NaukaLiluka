import { useMutation } from 'convex/react';
import { startOfDay } from 'date-fns';
import { api } from '@/convex/_generated/api';
import { parseCompletion } from '@/shared/presentation';

export function usePresentationCompletion(completionValue?: string, items: string[] = []) {
  const completeBook = useMutation(api.books.completeSession);
  const completeMath = useMutation(api.math.completeSession);
  const completeEquation = useMutation(api.equations.completeSession);
  const completeNoRep = useMutation(api.noRep.complete);
  const syncCycle = useMutation(api.routineCycle.syncTodayCompletion);

  return async () => {
    const completion = parseCompletion(completionValue);
    if (!completion) return;
    const todayStartMs = startOfDay(new Date()).getTime();
    switch (completion.kind) {
      case 'book':
        await completeBook({
          session: completion.session,
          type: completion.contentType,
          bookIndex: completion.bookIndex,
          tripleIndex: completion.tripleIndex,
          todayStartMs,
        });
        break;
      case 'math':
        await completeMath({ session: completion.session, todayStartMs });
        break;
      case 'equation':
        await completeEquation({ session: completion.session, todayStartMs });
        break;
      case 'noRep':
        await completeNoRep({ contentType: completion.contentType, items });
        break;
    }
    await syncCycle({ todayStartMs });
  };
}
