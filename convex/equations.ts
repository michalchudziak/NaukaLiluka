import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import {
  defaultEquationsProgress,
  equationsProgressValidator,
  equationsSessionCompletionValidator,
} from './validators';

export const getProgress = query({
  args: {},
  returns: equationsProgressValidator,
  handler: async (ctx) => {
    const progress = await ctx.db
      .query('equationsProgress')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
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
    const existing = await ctx.db
      .query('equationsProgress')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args.progress);
    } else {
      await ctx.db.insert('equationsProgress', {
        key: 'default',
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
    await ctx.db.insert('equationsSessionCompletions', {
      sessionType: args.session,
      category: args.category,
      dayNumber: args.day,
      completedAt: args.timestamp,
    });

    return null;
  },
});
