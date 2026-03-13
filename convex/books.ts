import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireCurrentUser } from './lib/current_user';
import {
  bookDailyPlanValidator,
  bookProgressValidator,
  bookTrackSessionValidator,
} from './validators';

export const listProgress = query({
  args: {},
  returns: v.array(bookProgressValidator),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const progress = await ctx.db
      .query('bookProgress')
      .withIndex('by_user_and_book_index', (q) => q.eq('userId', user._id))
      .collect();

    return progress.map((item) => ({
      bookId: item.bookIndex,
      bookTitle: item.bookTitle,
      completedTriples: item.completedTriples,
      progressTimestamp: item.progressTimestamp,
      isCompleted: item.isCompleted,
    }));
  },
});

export const replaceProgress = mutation({
  args: {
    progress: v.array(bookProgressValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query('bookProgress')
      .withIndex('by_user_and_book_key', (q) => q.eq('userId', user._id))
      .collect();
    const existingByKey = new Map(existing.map((item) => [item.bookKey, item]));
    const incomingKeys = new Set<string>();

    const upserts = args.progress.map((item) => {
      const bookKey = item.bookTitle || String(item.bookId);
      incomingKeys.add(bookKey);

      const value = {
        userId: user._id,
        bookKey,
        bookIndex: item.bookId,
        bookTitle: item.bookTitle || String(item.bookId),
        completedTriples: item.completedTriples,
        progressTimestamp: item.progressTimestamp,
        isCompleted: item.isCompleted,
      };

      const current = existingByKey.get(bookKey);
      if (current) {
        return ctx.db.patch(current._id, value);
      }

      return ctx.db.insert('bookProgress', value);
    });

    const removals = existing
      .filter((item) => !incomingKeys.has(item.bookKey))
      .map((item) => ctx.db.delete(item._id));

    await Promise.all([...upserts, ...removals]);
    return null;
  },
});

export const listTrackSessions = query({
  args: {},
  returns: v.array(bookTrackSessionValidator),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const sessions = await ctx.db
      .query('bookTrackSessions')
      .withIndex('by_user_and_completed_at', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    return sessions.map((item) => ({
      session: item.sessionName,
      type: item.contentType,
      timestamp: item.completedAt,
    }));
  },
});

export const insertTrackSession = mutation({
  args: bookTrackSessionValidator.fields,
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await ctx.db.insert('bookTrackSessions', {
      userId: user._id,
      sessionName: args.session,
      contentType: args.type,
      completedAt: args.timestamp,
    });

    return null;
  },
});

export const getLatestDailyPlan = query({
  args: {},
  returns: v.union(bookDailyPlanValidator, v.null()),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const latestPlan = await ctx.db
      .query('dailyPlans')
      .withIndex('by_user_and_created_at', (q) => q.eq('userId', user._id))
      .order('desc')
      .first();

    if (!latestPlan) {
      return null;
    }

    return {
      timestamp: latestPlan.createdAt,
      bookId: latestPlan.bookId,
      selectedWordTripleIndex: latestPlan.selectedWordTripleIndex,
      selectedSentenceTripleIndex: latestPlan.selectedSentenceTripleIndex,
      sessions: {
        session1: latestPlan.session1Content,
        session2: latestPlan.session2Content,
        session3: latestPlan.session3Content,
      },
    };
  },
});
