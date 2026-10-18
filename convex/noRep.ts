import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { requireCurrentUser } from './lib/current_user';
import { getContentPool } from './lib/noRepContent';
import { getRoutineProgress } from './lib/routineProgress';
import { defaultSettings } from './settingsSnapshot';
import { contentTypeValidator } from './validators';

type NoRepCtx = QueryCtx | MutationCtx;

async function findCompletionSince(
  ctx: NoRepCtx,
  userId: Id<'users'>,
  contentType: 'words' | 'sentences',
  sinceMs: number
) {
  return await ctx.db
    .query('noRepCompletions')
    .withIndex('by_user_and_content_type_and_completed_at', (q) =>
      q.eq('userId', userId).eq('contentType', contentType).gte('completedAt', sinceMs)
    )
    .first();
}

export async function getResolvedNoRepCompletion(
  ctx: NoRepCtx,
  userId: Id<'users'>,
  todayStartMs: number
) {
  const routineProgress = await getRoutineProgress(ctx, userId);
  const blockCompletedAt = routineProgress?.lastCompletions.find(
    (completion) => completion.blockId === 'noRep'
  )?.completedAt;

  if (blockCompletedAt !== undefined && blockCompletedAt >= todayStartMs) {
    return { isWordsCompleted: true, isSentencesCompleted: true };
  }

  // Words and sentences count once done after the block last finished, so
  // doing one part today and the other tomorrow still completes the block.
  const sinceMs = blockCompletedAt ?? routineProgress?.trackingStartMs ?? todayStartMs;
  const [wordsCompletion, sentencesCompletion] = await Promise.all([
    findCompletionSince(ctx, userId, 'words', sinceMs),
    findCompletionSince(ctx, userId, 'sentences', sinceMs),
  ]);

  return {
    isWordsCompleted: wordsCompletion !== null,
    isSentencesCompleted: sentencesCompletion !== null,
  };
}

export const getStatus = query({
  args: {
    todayStartMs: v.number(),
  },
  returns: v.object({
    displayedWordsCount: v.number(),
    displayedSentencesCount: v.number(),
    totalWordsCount: v.number(),
    totalSentencesCount: v.number(),
    isWordsCompleted: v.boolean(),
    isSentencesCompleted: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const [wordsProgress, sentencesProgress, completion] = await Promise.all([
      ctx.db
        .query('noRepProgress')
        .withIndex('by_user_and_content_type', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('contentType'), 'words'))
        .first(),
      ctx.db
        .query('noRepProgress')
        .withIndex('by_user_and_content_type', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('contentType'), 'sentences'))
        .first(),
      getResolvedNoRepCompletion(ctx, user._id, args.todayStartMs),
    ]);

    return {
      displayedWordsCount: wordsProgress?.displayedItems.length ?? 0,
      displayedSentencesCount: sentencesProgress?.displayedItems.length ?? 0,
      totalWordsCount: getContentPool('words').length,
      totalSentencesCount: getContentPool('sentences').length,
      ...completion,
    };
  },
});

export const choose = query({
  args: {
    contentType: contentTypeValidator,
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const settings = await ctx.db
      .query('settings')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();
    const snapshot = settings?.snapshot ?? defaultSettings;
    const count =
      args.contentType === 'words'
        ? snapshot.reading.noRep.words
        : snapshot.reading.noRep.sentences;

    const progress = await ctx.db
      .query('noRepProgress')
      .withIndex('by_user_and_content_type', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('contentType'), args.contentType))
      .first();
    const displayedItems = progress?.displayedItems ?? [];

    const pool = getContentPool(args.contentType);
    const displayedSet = new Set(displayedItems);
    const available = pool.filter((item) => !displayedSet.has(item));

    if (available.length === 0) {
      return [];
    }

    // Fisher-Yates partial shuffle for random selection
    const selected: string[] = [];
    const copy = [...available];
    const selectCount = Math.min(count, copy.length);
    for (let i = 0; i < selectCount; i++) {
      const j = i + Math.floor(Math.random() * (copy.length - i));
      [copy[i], copy[j]] = [copy[j], copy[i]];
      selected.push(copy[i]);
    }

    return selected;
  },
});

export const complete = mutation({
  args: {
    contentType: contentTypeValidator,
    items: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const pool = new Set(getContentPool(args.contentType));
    if (args.items.length === 0 || args.items.some((item) => !pool.has(item))) {
      throw new ConvexError('Invalid presentation content.');
    }
    const progress = await ctx.db
      .query('noRepProgress')
      .withIndex('by_user_and_content_type', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('contentType'), args.contentType))
      .first();
    const displayedItems = progress?.displayedItems ?? [];
    const newDisplayedItems = Array.from(new Set([...displayedItems, ...args.items]));
    if (newDisplayedItems.length === displayedItems.length) return null;
    if (progress) {
      await ctx.db.patch(progress._id, { displayedItems: newDisplayedItems });
    } else {
      await ctx.db.insert('noRepProgress', {
        userId: user._id,
        contentType: args.contentType,
        displayedItems: newDisplayedItems,
      });
    }

    await ctx.db.insert('noRepCompletions', {
      userId: user._id,
      contentType: args.contentType,
      completedAt: Date.now(),
    });

    return null;
  },
});
