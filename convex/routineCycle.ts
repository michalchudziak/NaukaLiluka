import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import {
  getNewlyCompletedRoutineBlockIds,
  getTodayRoutineBlockIds,
  type RoutineBlockId,
  withRoutineBlockCompletions,
} from '../shared/dailyCommitment';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { getResolvedBookStatus } from './books';
import { getResolvedEquationsStatus } from './equations';
import { requireCurrentUser } from './lib/current_user';
import { getRoutineProgress } from './lib/routineProgress';
import { getResolvedMathStatus } from './math';
import { getResolvedNoRepCompletion } from './noRep';
import { defaultSettings } from './settingsSnapshot';
import { dailyCommitmentMinutesValidator, routineBlockIdValidator } from './validators';

type RoutineCycleCtx = QueryCtx | MutationCtx;

const routinePlanValidator = v.object({
  commitmentMinutes: v.union(dailyCommitmentMinutesValidator, v.null()),
  activeBlockIds: v.array(routineBlockIdValidator),
});

async function getSettingsSnapshot(ctx: RoutineCycleCtx, userId: Id<'users'>) {
  const settings = await ctx.db
    .query('settings')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();

  return settings?.snapshot ?? defaultSettings;
}

// Book and math blocks are done while their session is done for the current
// set or day; that session cannot be repeated, so a block rotating back before
// the set finishes counts as done. No-rep can always be repeated, so it only
// counts work since the block last finished.
async function getRoutineCompletionMap(
  ctx: RoutineCycleCtx,
  userId: Id<'users'>,
  todayStartMs: number
) {
  const [noRepCompletion, bookStatus, mathStatus, equationsStatus, drawing] = await Promise.all([
    getResolvedNoRepCompletion(ctx, userId, todayStartMs),
    getResolvedBookStatus(ctx, userId, todayStartMs),
    getResolvedMathStatus(ctx, userId, todayStartMs),
    getResolvedEquationsStatus(ctx, userId, todayStartMs),
    ctx.db
      .query('drawingPresentations')
      .withIndex('by_user_and_presented_at', (q) =>
        q.eq('userId', userId).gte('presentedAt', todayStartMs)
      )
      .first(),
  ]);

  return {
    noRep: noRepCompletion.isWordsCompleted && noRepCompletion.isSentencesCompleted,
    bookSession1: bookStatus.sessions.session1.isWordsCompleted,
    bookSession2: bookStatus.sessions.session2.isWordsCompleted,
    bookSession3:
      bookStatus.sessions.session3.isWordsCompleted &&
      (!bookStatus.sessions.session3.hasSentences ||
        bookStatus.sessions.session3.isSentencesCompleted),
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
      return { commitmentMinutes: null, activeBlockIds: [] };
    }

    const routineProgress = await getRoutineProgress(ctx, user._id);

    return {
      commitmentMinutes,
      activeBlockIds: getTodayRoutineBlockIds(
        commitmentMinutes,
        routineProgress?.lastCompletions ?? [],
        args.todayStartMs
      ),
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

    const routineProgress = await getRoutineProgress(ctx, user._id);
    const lastCompletions = routineProgress?.lastCompletions ?? [];
    const newlyCompletedBlockIds = getNewlyCompletedRoutineBlockIds(
      commitmentMinutes,
      lastCompletions,
      args.todayStartMs,
      await getRoutineCompletionMap(ctx, user._id, args.todayStartMs)
    );
    const nextCompletions = withRoutineBlockCompletions(
      lastCompletions,
      newlyCompletedBlockIds,
      Date.now()
    );

    // Created on the first sync even with nothing finished, which fixes the
    // day from which no-rep completions start counting.
    if (!routineProgress) {
      await ctx.db.insert('routineProgress', {
        userId: user._id,
        trackingStartMs: args.todayStartMs,
        lastCompletions: nextCompletions,
      });
    } else if (newlyCompletedBlockIds.length > 0) {
      await ctx.db.patch(routineProgress._id, { lastCompletions: nextCompletions });
    }

    return null;
  },
});
