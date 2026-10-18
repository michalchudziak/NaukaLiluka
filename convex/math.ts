import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { requireCurrentUser } from './lib/current_user';
import { defaultMathProgress, mathSessionValidator } from './validators';

type MathSession =
  | 'subitizingOrdered'
  | 'subitizingUnordered'
  | 'numbersOrdered'
  | 'numbersUnordered';
type StoredMathProgress = {
  currentDay: number;
  lastSessionDate: string | null;
  completedSessions: MathSession[];
};
type MathCtx = QueryCtx | MutationCtx;

const mathStatusValidator = v.object({
  currentDay: v.number(),
  completedSessions: v.array(mathSessionValidator),
  isDayCompleted: v.boolean(),
  sessions: v.object({
    session1: v.boolean(),
    session2: v.boolean(),
  }),
  hasGraduatedToEquations: v.boolean(),
});

const isProgressFromToday = (lastSessionDate: string | null, todayStartMs: number) =>
  lastSessionDate !== null && Date.parse(lastSessionDate) >= todayStartMs;

const getSessionGroupsForDay = (day: number): MathSession[][] => {
  if (day > 30) {
    return [
      ['subitizingOrdered', 'numbersOrdered'],
      ['subitizingUnordered', 'numbersUnordered'],
    ];
  }

  if (day > 15) {
    return [['subitizingOrdered', 'numbersOrdered'], ['numbersUnordered']];
  }

  return [['subitizingOrdered'], ['subitizingUnordered']];
};

const areAllRequiredSessionsCompleted = (
  sessionGroups: MathSession[][],
  completedSessions: MathSession[]
) => sessionGroups.flat().every((session) => completedSessions.includes(session));

export function resolveMathStatus(progress: StoredMathProgress, todayStartMs: number) {
  const progressIsFromToday = isProgressFromToday(progress.lastSessionDate, todayStartMs);
  const previousDayGroups = getSessionGroupsForDay(progress.currentDay);
  const previousDayCompleted = areAllRequiredSessionsCompleted(
    previousDayGroups,
    progress.completedSessions
  );
  const shouldAdvanceDay =
    progress.lastSessionDate !== null && !progressIsFromToday && previousDayCompleted;
  const currentDay = shouldAdvanceDay ? progress.currentDay + 1 : progress.currentDay;
  const sessionGroups = getSessionGroupsForDay(currentDay);
  // Sessions done on earlier calendar days still count, so an unfinished day
  // carries over instead of resetting.
  const completedSessions = shouldAdvanceDay ? [] : progress.completedSessions;

  return {
    currentDay,
    completedSessions,
    sessionGroups,
  };
}

export async function getResolvedMathStatus(
  ctx: MathCtx,
  userId: Id<'users'>,
  todayStartMs: number
) {
  const progress = await ctx.db
    .query('mathProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();
  const effectiveProgress = resolveMathStatus(
    progress
      ? {
          currentDay: progress.currentDay,
          lastSessionDate: progress.lastSessionDate,
          completedSessions: progress.completedSessions,
        }
      : defaultMathProgress,
    todayStartMs
  );
  const [session1, session2] = effectiveProgress.sessionGroups;

  return {
    currentDay: effectiveProgress.currentDay,
    completedSessions: effectiveProgress.completedSessions,
    isDayCompleted: areAllRequiredSessionsCompleted(
      effectiveProgress.sessionGroups,
      effectiveProgress.completedSessions
    ),
    sessions: {
      session1: areAllRequiredSessionsCompleted([session1], effectiveProgress.completedSessions),
      session2: areAllRequiredSessionsCompleted([session2], effectiveProgress.completedSessions),
    },
    hasGraduatedToEquations: effectiveProgress.currentDay > 30,
  };
}

export const getStatus = query({
  args: {
    todayStartMs: v.number(),
  },
  returns: mathStatusValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    return await getResolvedMathStatus(ctx, user._id, args.todayStartMs);
  },
});

export const completeSession = mutation({
  args: {
    session: mathSessionValidator,
    todayStartMs: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query('mathProgress')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    const storedProgress = existing
      ? {
          currentDay: existing.currentDay,
          lastSessionDate: existing.lastSessionDate,
          completedSessions: existing.completedSessions,
        }
      : defaultMathProgress;
    const effectiveProgress = resolveMathStatus(storedProgress, args.todayStartMs);

    if (effectiveProgress.completedSessions.includes(args.session)) {
      return null;
    }

    const nextProgress = {
      currentDay: effectiveProgress.currentDay,
      lastSessionDate: new Date().toISOString(),
      completedSessions: [...effectiveProgress.completedSessions, args.session],
    };

    if (existing) {
      await ctx.db.patch(existing._id, nextProgress);
    } else {
      await ctx.db.insert('mathProgress', {
        userId: user._id,
        ...nextProgress,
      });
    }

    return null;
  },
});
