import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { getResolvedBookStatus } from './books';
import { getResolvedEquationsStatus } from './equations';
import { getResolvedMathStatus } from './math';
import { requireCurrentUser } from './lib/current_user';
import { defaultSettings } from './settingsSnapshot';
import { dailyCommitmentMinutesValidator, routineBlockIdValidator } from './validators';
import {
  getActiveRoutineWindow,
  isSameDayProgressRequired,
  type DailyCommitmentMinutes,
  type RoutineBlockId,
} from '../shared/dailyCommitment';

type RoutineCycleCtx = QueryCtx | MutationCtx;

const routinePlanValidator = v.object({
  commitmentMinutes: v.union(dailyCommitmentMinutesValidator, v.null()),
  sameDayProgressRequired: v.boolean(),
  activeBlockIds: v.array(routineBlockIdValidator),
  completedWindowToday: v.boolean(),
  completedWindowsBeforeToday: v.number(),
});

async function getSettingsSnapshot(ctx: RoutineCycleCtx, userId: Id<'users'>) {
  const settings = await ctx.db
    .query('settings')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();

  return settings?.snapshot ?? defaultSettings;
}

async function getRoutineCycleState(
  ctx: RoutineCycleCtx,
  userId: Id<'users'>,
  todayStartMs: number,
  commitmentMinutes: DailyCommitmentMinutes
) {
  const completions = await ctx.db
    .query('routineCycleCompletions')
    .withIndex('by_user_commitment_completed_at', (q) =>
      q.eq('userId', userId).eq('commitmentMinutes', commitmentMinutes)
    )
    .collect();
  const completedWindowsBeforeToday = completions.filter(
    (completion) => completion.completedAt < todayStartMs
  ).length;

  return {
    completedWindowsBeforeToday,
    completedWindowToday: completions.some((completion) => completion.completedAt >= todayStartMs),
    activeBlockIds: getActiveRoutineWindow(commitmentMinutes, completedWindowsBeforeToday),
  };
}

async function getRoutineCompletionMap(
  ctx: RoutineCycleCtx,
  userId: Id<'users'>,
  todayStartMs: number,
  commitmentMinutes: DailyCommitmentMinutes
) {
  const sameDayProgressRequired = isSameDayProgressRequired(commitmentMinutes);
  const [bookStatus, mathStatus, equationsStatus, wordsCompletion, sentencesCompletion, drawing] =
    await Promise.all([
      getResolvedBookStatus(ctx, userId, todayStartMs, sameDayProgressRequired),
      getResolvedMathStatus(ctx, userId, todayStartMs, sameDayProgressRequired),
      getResolvedEquationsStatus(ctx, userId, todayStartMs, sameDayProgressRequired),
      ctx.db
        .query('noRepCompletions')
        .withIndex('by_user_and_content_type_and_completed_at', (q) => q.eq('userId', userId))
        .filter((q) =>
          q.and(
            q.eq(q.field('contentType'), 'words'),
            q.gte(q.field('completedAt'), todayStartMs)
          )
        )
        .first(),
      ctx.db
        .query('noRepCompletions')
        .withIndex('by_user_and_content_type_and_completed_at', (q) => q.eq('userId', userId))
        .filter((q) =>
          q.and(
            q.eq(q.field('contentType'), 'sentences'),
            q.gte(q.field('completedAt'), todayStartMs)
          )
        )
        .first(),
      ctx.db
        .query('drawingPresentations')
        .withIndex('by_user_and_presented_at', (q) => q.eq('userId', userId))
        .filter((q) => q.gte(q.field('presentedAt'), todayStartMs))
        .first(),
    ]);

  return {
    noRep: wordsCompletion !== null && sentencesCompletion !== null,
    bookSession1: bookStatus.sessions.session1.isWordsCompleted,
    bookSession2: bookStatus.sessions.session2.isWordsCompleted,
    bookSession3:
      bookStatus.sessions.session3.isWordsCompleted &&
      (!bookStatus.sessions.session3.hasSentences || bookStatus.sessions.session3.isSentencesCompleted),
    drawings: drawing !== null,
    mathSession1: mathStatus.hasGraduatedToEquations
      ? equationsStatus.sessions.session1
      : mathStatus.sessions.session1,
    mathSession2: mathStatus.hasGraduatedToEquations
      ? equationsStatus.sessions.session2
      : mathStatus.sessions.session2,
  } satisfies Record<RoutineBlockId, boolean>;
}

export const getTodayPlan = query({
  args: {
    todayStartMs: v.number(),
  },
  returns: routinePlanValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const settingsSnapshot = await getSettingsSnapshot(ctx, user._id);
    const commitmentMinutes = settingsSnapshot.onboarding.dailyCommitmentMinutes;

    if (commitmentMinutes === null) {
      return {
        commitmentMinutes: null,
        sameDayProgressRequired: false,
        activeBlockIds: [],
        completedWindowToday: false,
        completedWindowsBeforeToday: 0,
      };
    }

    const routineCycleState = await getRoutineCycleState(
      ctx,
      user._id,
      args.todayStartMs,
      commitmentMinutes
    );

    return {
      commitmentMinutes,
      sameDayProgressRequired: isSameDayProgressRequired(commitmentMinutes),
      ...routineCycleState,
    };
  },
});

export const syncTodayCompletion = mutation({
  args: {
    todayStartMs: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const settingsSnapshot = await getSettingsSnapshot(ctx, user._id);
    const commitmentMinutes = settingsSnapshot.onboarding.dailyCommitmentMinutes;

    if (commitmentMinutes === null) {
      return null;
    }

    const routineCycleState = await getRoutineCycleState(
      ctx,
      user._id,
      args.todayStartMs,
      commitmentMinutes
    );

    if (routineCycleState.completedWindowToday) {
      return null;
    }

    const completionMap = await getRoutineCompletionMap(
      ctx,
      user._id,
      args.todayStartMs,
      commitmentMinutes
    );
    const isActiveWindowCompleted = routineCycleState.activeBlockIds.every(
      (blockId) => completionMap[blockId]
    );

    if (!isActiveWindowCompleted) {
      return null;
    }

    await ctx.db.insert('routineCycleCompletions', {
      userId: user._id,
      commitmentMinutes,
      completedAt: Date.now(),
    });

    return null;
  },
});
