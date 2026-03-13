import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireCurrentUser } from './lib/current_user';
import { defaultSettings, settingsSnapshotValidator } from './validators';

export const get = query({
  args: {},
  returns: settingsSnapshotValidator,
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const settings = await ctx.db
      .query('settings')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    return settings?.snapshot ?? defaultSettings;
  },
});

export const upsert = mutation({
  args: {
    snapshot: settingsSnapshotValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query('settings')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { snapshot: args.snapshot });
    } else {
      await ctx.db.insert('settings', {
        userId: user._id,
        snapshot: args.snapshot,
      });
    }

    return null;
  },
});
