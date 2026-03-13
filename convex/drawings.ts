import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { drawingPresentationValidator } from './validators';

export const listPresentations = query({
  args: {},
  returns: v.array(drawingPresentationValidator),
  handler: async (ctx) => {
    const presentations = await ctx.db
      .query('drawingPresentations')
      .withIndex('by_presented_at')
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
    await ctx.db.insert('drawingPresentations', {
      setTitle: args.setTitle,
      presentedAt: args.timestamp,
    });

    return null;
  },
});
