import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireCurrentUser } from './lib/current_user';
import { drawingPresentationValidator } from './validators';

export const listPresentations = query({
  args: {},
  returns: v.array(drawingPresentationValidator),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const presentations = await ctx.db
      .query('drawingPresentations')
      .withIndex('by_user_and_presented_at', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    return presentations.map((item) => ({
      setTitle: item.setTitle,
      timestamp: item.presentedAt,
    }));
  },
});

export const insertPresentation = mutation({
  args: drawingPresentationValidator.fields,
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await ctx.db.insert('drawingPresentations', {
      userId: user._id,
      setTitle: args.setTitle,
      presentedAt: args.timestamp,
    });

    return null;
  },
});
