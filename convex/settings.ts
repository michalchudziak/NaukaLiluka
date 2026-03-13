import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { defaultSettings, settingsSnapshotValidator } from './validators';

export const get = query({
  args: {},
  returns: settingsSnapshotValidator,
  handler: async (ctx) => {
    const settings = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
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
    const existing = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { snapshot: args.snapshot });
    } else {
      await ctx.db.insert('settings', {
        key: 'default',
        snapshot: args.snapshot,
      });
    }

    return null;
  },
});
