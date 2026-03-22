import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { requireCurrentUser } from './lib/current_user';
import {
  applyDrawingsPatch,
  applyMathEquationsPatch,
  applyMathNumbersPatch,
  applyReadingBooksPatch,
  applyReadingIntervalPatch,
  applyReadingNoRepPatch,
  applyReadingWordSpacingPatch,
  defaultSettings,
  type SettingsSnapshot,
} from './settingsSnapshot';
import { settingsSnapshotValidator } from './validators';

type SettingsCtx = QueryCtx | MutationCtx;

async function getCurrentSettings(ctx: SettingsCtx, userId: Id<'users'>) {
  return await ctx.db
    .query('settings')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();
}

async function updateSettingsSnapshot(
  ctx: MutationCtx,
  updater: (settings: SettingsSnapshot) => SettingsSnapshot
) {
  const user = await requireCurrentUser(ctx);
  const existing = await getCurrentSettings(ctx, user._id);
  const nextSnapshot = updater(existing?.snapshot ?? defaultSettings);

  if (existing) {
    await ctx.db.patch(existing._id, { snapshot: nextSnapshot });
  } else {
    await ctx.db.insert('settings', {
      userId: user._id,
      snapshot: nextSnapshot,
    });
  }

  return null;
}

export const get = query({
  args: {},
  returns: settingsSnapshotValidator,
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const settings = await getCurrentSettings(ctx, user._id);

    return settings?.snapshot ?? defaultSettings;
  },
});

export const updateReadingNoRep = mutation({
  args: {
    words: v.optional(v.number()),
    sentences: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await updateSettingsSnapshot(ctx, (settings) => applyReadingNoRepPatch(settings, args));
  },
});

export const updateReadingInterval = mutation({
  args: {
    words: v.optional(v.number()),
    sentences: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await updateSettingsSnapshot(ctx, (settings) =>
      applyReadingIntervalPatch(settings, args)
    );
  },
});

export const updateReadingBooks = mutation({
  args: {
    allowAllBooks: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await updateSettingsSnapshot(ctx, (settings) => applyReadingBooksPatch(settings, args));
  },
});

export const updateReadingWordSpacing = mutation({
  args: {
    value: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await updateSettingsSnapshot(ctx, (settings) =>
      applyReadingWordSpacingPatch(settings, args.value)
    );
  },
});

export const updateDrawings = mutation({
  args: {
    showCaptions: v.optional(v.boolean()),
    interval: v.optional(v.number()),
    randomOrder: v.optional(v.boolean()),
    showFacts: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await updateSettingsSnapshot(ctx, (settings) => applyDrawingsPatch(settings, args));
  },
});

export const updateMathEquations = mutation({
  args: {
    interval: v.optional(v.number()),
    equationCount: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await updateSettingsSnapshot(ctx, (settings) => applyMathEquationsPatch(settings, args));
  },
});

export const updateMathNumbers = mutation({
  args: {
    interval: v.optional(v.number()),
    numberCount: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await updateSettingsSnapshot(ctx, (settings) => applyMathNumbersPatch(settings, args));
  },
});
