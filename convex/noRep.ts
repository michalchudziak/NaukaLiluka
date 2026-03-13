import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { contentTypeValidator } from './validators';

export const getProgress = query({
  args: {
    contentType: contentTypeValidator,
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query('noRepProgress')
      .withIndex('by_content_type', (q) => q.eq('contentType', args.contentType))
      .first();

    return progress?.displayedItems ?? [];
  },
});

export const setProgress = mutation({
  args: {
    contentType: contentTypeValidator,
    items: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('noRepProgress')
      .withIndex('by_content_type', (q) => q.eq('contentType', args.contentType))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { displayedItems: args.items });
    } else {
      await ctx.db.insert('noRepProgress', {
        contentType: args.contentType,
        displayedItems: args.items,
      });
    }

    return null;
  },
});

export const listCompletions = query({
  args: {
    contentType: contentTypeValidator,
  },
  returns: v.array(v.number()),
  handler: async (ctx, args) => {
    const completions = await ctx.db
      .query('noRepCompletions')
      .withIndex('by_content_type_and_completed_at', (q) => q.eq('contentType', args.contentType))
      .order('desc')
      .collect();

    return completions.map((item) => item.completedAt);
  },
});

export const insertCompletion = mutation({
  args: {
    contentType: contentTypeValidator,
    timestamp: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert('noRepCompletions', {
      contentType: args.contentType,
      completedAt: args.timestamp,
    });

    return null;
  },
});
