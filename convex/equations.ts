import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireCurrentUser } from './lib/current_user';
import {
  defaultEquationsProgress,
  equationsProgressValidator,
  equationsSessionCompletionValidator,
} from './validators';

export const getProgress = query({
  args: {},
  returns: equationsProgressValidator,
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const progress = await ctx.db
      .query('equationsProgress')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (!progress) {
      return defaultEquationsProgress;
    }

    return {
      currentDay: progress.currentDay,
      currentCategory: progress.currentCategory,
      lastSessionDate: progress.lastSessionDate,
      completedSessions: progress.completedSessions,
    };
  },
});

export const upsertProgress = mutation({
  args: {
    progress: equationsProgressValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query('equationsProgress')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args.progress);
    } else {
      await ctx.db.insert('equationsProgress', {
        userId: user._id,
        ...args.progress,
      });
    }

    return null;
  },
});

export const insertSessionCompletion = mutation({
  args: equationsSessionCompletionValidator.fields,
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await ctx.db.insert('equationsSessionCompletions', {
      userId: user._id,
      sessionType: args.session,
      category: args.category,
      dayNumber: args.day,
      completedAt: args.timestamp,
    });

    return null;
  },
});
