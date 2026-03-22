import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireCurrentUser } from './lib/current_user';
import { defaultMathProgress, mathSessionValidator } from './validators';

type MathSession =
  | 'subitizingOrdered'
  | 'subitizingUnordered'
  | 'numbersOrdered'
  | 'numbersUnordered';

const mathStatusValidator = v.object({
  currentDay: v.number(),
  completedSessionsToday: v.array(mathSessionValidator),
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

const resolveMathStatus = (progress: typeof defaultMathProgress, todayStartMs: number) => {
  const progressIsFromToday = isProgressFromToday(progress.lastSessionDate, todayStartMs);
  const previousDayGroups = getSessionGroupsForDay(progress.currentDay);
  const shouldAdvanceDay =
    progress.lastSessionDate !== null &&
    !progressIsFromToday &&
    areAllRequiredSessionsCompleted(previousDayGroups, progress.completedSessions);

  const currentDay = shouldAdvanceDay ? progress.currentDay + 1 : progress.currentDay;
  const completedSessionsToday = progressIsFromToday ? progress.completedSessions : [];
  const sessionGroups = getSessionGroupsForDay(currentDay);

  return {
    currentDay,
    completedSessionsToday,
    sessionGroups,
  };
};

export const getStatus = query({
  args: {
    todayStartMs: v.number(),
  },
  returns: mathStatusValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const progress = await ctx.db
      .query('mathProgress')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    const effectiveProgress = resolveMathStatus(
      progress
        ? {
            currentDay: progress.currentDay,
            lastSessionDate: progress.lastSessionDate,
            completedSessions: progress.completedSessions,
          }
        : defaultMathProgress,
      args.todayStartMs
    );

    const [session1, session2] = effectiveProgress.sessionGroups;

    return {
      currentDay: effectiveProgress.currentDay,
      completedSessionsToday: effectiveProgress.completedSessionsToday,
      isDayCompleted: areAllRequiredSessionsCompleted(
        effectiveProgress.sessionGroups,
        effectiveProgress.completedSessionsToday
      ),
      sessions: {
        session1: areAllRequiredSessionsCompleted(
          [session1],
          effectiveProgress.completedSessionsToday
        ),
        session2: areAllRequiredSessionsCompleted(
          [session2],
          effectiveProgress.completedSessionsToday
        ),
      },
      hasGraduatedToEquations: effectiveProgress.currentDay > 30,
    };
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

    if (effectiveProgress.completedSessionsToday.includes(args.session)) {
      return null;
    }

    const nextProgress = {
      currentDay: effectiveProgress.currentDay,
      lastSessionDate: new Date().toISOString(),
      completedSessions: [...effectiveProgress.completedSessionsToday, args.session],
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
