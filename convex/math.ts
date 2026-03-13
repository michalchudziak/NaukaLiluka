import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireCurrentUser } from './lib/current_user';
import {
  defaultMathProgress,
  mathProgressValidator,
  mathSessionCompletionValidator,
} from './validators';

export const getProgress = query({
  args: {},
  returns: mathProgressValidator,
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const progress = await ctx.db
      .query('mathProgress')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (!progress) {
      return defaultMathProgress;
    }

    return {
      currentDay: progress.currentDay,
      lastSessionDate: progress.lastSessionDate,
      completedSessions: progress.completedSessions,
    };
  },
});

export const upsertProgress = mutation({
  args: {
    progress: mathProgressValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query('mathProgress')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args.progress);
    } else {
      await ctx.db.insert('mathProgress', {
        userId: user._id,
        ...args.progress,
      });
    }

    return null;
  },
});

export const insertSessionCompletion = mutation({
  args: mathSessionCompletionValidator.fields,
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await ctx.db.insert('mathSessionCompletions', {
      userId: user._id,
      sessionType: args.session,
      dayNumber: args.day,
      completedAt: args.timestamp,
    });

    return null;
  },
});
