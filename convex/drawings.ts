import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireCurrentUser } from './lib/current_user';
import { drawingStatusValidator } from './validators';

export const getTodayStatus = query({
  args: {
    todayStartMs: v.number(),
  },
  returns: drawingStatusValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const completion = await ctx.db
      .query('drawingPresentations')
      .withIndex('by_user_and_presented_at', (q) => q.eq('userId', user._id))
      .filter((q) => q.gte(q.field('presentedAt'), args.todayStartMs))
      .first();

    if (!completion) {
      return {
        completedToday: false,
        completedSetTitle: null,
        completedAt: null,
      };
    }

    return {
      completedToday: true,
      completedSetTitle: completion.setTitle,
      completedAt: completion.presentedAt,
    };
  },
});

export const completeSession = mutation({
  args: {
    setTitle: v.string(),
    todayStartMs: v.number(),
  },
  returns: drawingStatusValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existingCompletion = await ctx.db
      .query('drawingPresentations')
      .withIndex('by_user_and_presented_at', (q) => q.eq('userId', user._id))
      .filter((q) => q.gte(q.field('presentedAt'), args.todayStartMs))
      .first();

    if (existingCompletion) {
      return {
        completedToday: true,
        completedSetTitle: existingCompletion.setTitle,
        completedAt: existingCompletion.presentedAt,
      };
    }

    const completedAt = Date.now();
    await ctx.db.insert('drawingPresentations', {
      userId: user._id,
      setTitle: args.setTitle,
      presentedAt: completedAt,
    });

    return {
      completedToday: true,
      completedSetTitle: args.setTitle,
      completedAt,
    };
  },
});
