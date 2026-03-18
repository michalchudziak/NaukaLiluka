import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireCurrentUser } from './lib/current_user';
import { getContentPool } from './lib/noRepContent';
import { contentTypeValidator, defaultSettings } from './validators';

export const getStatus = query({
  args: {
    todayStartMs: v.number(),
  },
  returns: v.object({
    displayedWordsCount: v.number(),
    displayedSentencesCount: v.number(),
    totalWordsCount: v.number(),
    totalSentencesCount: v.number(),
    isWordsCompletedToday: v.boolean(),
    isSentencesCompletedToday: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const [wordsProgress, sentencesProgress] = await Promise.all([
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
    ]);

    const [wordsCompletion, sentencesCompletion] = await Promise.all([
      ctx.db
        .query('noRepCompletions')
        .withIndex('by_user_and_content_type_and_completed_at', (q) => q.eq('userId', user._id))
        .filter((q) =>
          q.and(
            q.eq(q.field('contentType'), 'words'),
            q.gte(q.field('completedAt'), args.todayStartMs)
          )
        )
        .first(),
      ctx.db
        .query('noRepCompletions')
        .withIndex('by_user_and_content_type_and_completed_at', (q) => q.eq('userId', user._id))
        .filter((q) =>
          q.and(
            q.eq(q.field('contentType'), 'sentences'),
            q.gte(q.field('completedAt'), args.todayStartMs)
          )
        )
        .first(),
    ]);

    return {
      displayedWordsCount: wordsProgress?.displayedItems.length ?? 0,
      displayedSentencesCount: sentencesProgress?.displayedItems.length ?? 0,
      totalWordsCount: getContentPool('words').length,
      totalSentencesCount: getContentPool('sentences').length,
      isWordsCompletedToday: wordsCompletion !== null,
      isSentencesCompletedToday: sentencesCompletion !== null,
    };
  },
});

export const chooseAndMark = mutation({
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

    const newDisplayedItems = [...displayedItems, ...selected];
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

    return selected;
  },
});
