import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { BOOK_METADATA, getRequiredDays, tripleHasSentences } from './lib/bookContent';
import { requireCurrentUser } from './lib/current_user';
import { bookSessionNameValidator, contentTypeValidator } from './validators';

const sessionStatusValidator = v.object({
  hasWords: v.boolean(),
  hasSentences: v.boolean(),
  isWordsCompleted: v.boolean(),
  isSentencesCompleted: v.boolean(),
});

const todayStatusValidator = v.object({
  activeBookIndex: v.number(),
  activeBookTitle: v.string(),
  activeBookCompleted: v.boolean(),
  currentTripleIndex: v.number(),
  isDayCompleted: v.boolean(),
  sessions: v.object({
    session1: sessionStatusValidator,
    session2: sessionStatusValidator,
    session3: sessionStatusValidator,
  }),
});

type BookProgressDoc = {
  _id: any;
  bookIndex: number;
  isCompleted: boolean;
  completedTriples: number[];
  progressTimestamp: number;
};

/** Find the first non-completed book. Returns index 0 if all are done. */
function findActiveBook(allProgress: BookProgressDoc[]) {
  for (let i = 0; i < BOOK_METADATA.length; i++) {
    const prog = allProgress.find((p) => p.bookIndex === i);
    if (!prog?.isCompleted) {
      return { activeBookIndex: i, activeProgress: prog, allCompleted: false };
    }
  }
  return {
    activeBookIndex: 0,
    activeProgress: allProgress.find((p) => p.bookIndex === 0),
    allCompleted: true,
  };
}

/** Resolve which triple index to show today for the given book. */
function resolveTripleIndex(
  completedTriples: number[],
  progressTimestamp: number | undefined,
  todayStartMs: number,
  tripleCount: number
): number {
  const progressUpdatedToday = progressTimestamp != null && progressTimestamp >= todayStartMs;

  if (progressUpdatedToday && completedTriples.length > 0) {
    // Reuse today's completed triple for the rest of the day
    return completedTriples[completedTriples.length - 1];
  }

  // Find first uncompleted triple
  for (let i = 0; i < tripleCount; i++) {
    if (!completedTriples.includes(i)) return i;
  }

  // All triples done (book complete) — use the last one
  return Math.max(0, tripleCount - 1);
}

/**
 * Returns today's book status: active book, current triple, session completions.
 * This is the primary query for all book-related UI.
 */
export const getTodayStatus = query({
  args: { todayStartMs: v.number() },
  returns: todayStatusValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const allProgress = await ctx.db
      .query('bookProgress')
      .withIndex('by_user_and_book_index', (q) => q.eq('userId', user._id))
      .collect();

    const { activeBookIndex, activeProgress, allCompleted } = findActiveBook(allProgress);

    const meta = BOOK_METADATA[activeBookIndex];
    const completedTriples = activeProgress?.completedTriples ?? [];

    const currentTripleIndex = resolveTripleIndex(
      completedTriples,
      activeProgress?.progressTimestamp,
      args.todayStartMs,
      meta.tripleCount
    );

    // Get today's session completions
    const todaySessions = await ctx.db
      .query('bookTrackSessions')
      .withIndex('by_user_and_completed_at', (q) => q.eq('userId', user._id))
      .filter((q) => q.gte(q.field('completedAt'), args.todayStartMs))
      .collect();

    const isSessionDone = (session: string, type: string) =>
      todaySessions.some((s) => s.sessionName === session && s.contentType === type);

    const hasSentences = tripleHasSentences(activeBookIndex, currentTripleIndex);

    const sessions = {
      session1: {
        hasWords: true,
        hasSentences: false,
        isWordsCompleted: isSessionDone('session1', 'words'),
        isSentencesCompleted: false,
      },
      session2: {
        hasWords: true,
        hasSentences: false,
        isWordsCompleted: isSessionDone('session2', 'words'),
        isSentencesCompleted: false,
      },
      session3: {
        hasWords: true,
        hasSentences,
        isWordsCompleted: isSessionDone('session3', 'words'),
        isSentencesCompleted: isSessionDone('session3', 'sentences'),
      },
    };

    const isDayCompleted =
      sessions.session1.isWordsCompleted &&
      sessions.session2.isWordsCompleted &&
      sessions.session3.isWordsCompleted &&
      (!hasSentences || sessions.session3.isSentencesCompleted);

    return {
      activeBookIndex,
      activeBookTitle: meta.title,
      activeBookCompleted: allCompleted || (activeProgress?.isCompleted ?? false),
      currentTripleIndex,
      isDayCompleted,
      sessions,
    };
  },
});

/**
 * Records a session completion and handles book advancement.
 * All business logic (day completion, triple advancement, book advancement) runs atomically.
 */
export const completeSession = mutation({
  args: {
    session: bookSessionNameValidator,
    type: contentTypeValidator,
    todayStartMs: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Check if already completed today
    const existing = await ctx.db
      .query('bookTrackSessions')
      .withIndex('by_user_and_completed_at', (q) => q.eq('userId', user._id))
      .filter((q) => q.gte(q.field('completedAt'), args.todayStartMs))
      .collect();

    const alreadyDone = existing.some(
      (s) => s.sessionName === args.session && s.contentType === args.type
    );
    if (alreadyDone) return null;

    // Insert the session completion
    await ctx.db.insert('bookTrackSessions', {
      userId: user._id,
      sessionName: args.session,
      contentType: args.type,
      completedAt: Date.now(),
    });

    // Determine active book
    const allProgress = await ctx.db
      .query('bookProgress')
      .withIndex('by_user_and_book_index', (q) => q.eq('userId', user._id))
      .collect();

    const { activeBookIndex, activeProgress } = findActiveBook(allProgress);

    const meta = BOOK_METADATA[activeBookIndex];
    const completedTriples = activeProgress?.completedTriples ?? [];

    const currentTripleIndex = resolveTripleIndex(
      completedTriples,
      activeProgress?.progressTimestamp,
      args.todayStartMs,
      meta.tripleCount
    );

    // Check if day is now complete (including the session we just inserted)
    const allTodaySessions = [...existing, { sessionName: args.session, contentType: args.type }];
    const isDone = (session: string, type: string) =>
      allTodaySessions.some((s) => s.sessionName === session && s.contentType === type);

    const hasSentences = tripleHasSentences(activeBookIndex, currentTripleIndex);
    const isDayCompleted =
      isDone('session1', 'words') &&
      isDone('session2', 'words') &&
      isDone('session3', 'words') &&
      (!hasSentences || isDone('session3', 'sentences'));

    if (!isDayCompleted) return null;

    // Day is complete - mark triple as done
    if (completedTriples.includes(currentTripleIndex)) return null;

    const newCompletedTriples = [...completedTriples, currentTripleIndex];
    const isBookCompleted = newCompletedTriples.length >= getRequiredDays(activeBookIndex);

    if (activeProgress) {
      await ctx.db.patch(activeProgress._id, {
        completedTriples: newCompletedTriples,
        progressTimestamp: Date.now(),
        isCompleted: isBookCompleted,
      });
    } else {
      await ctx.db.insert('bookProgress', {
        userId: user._id,
        bookKey: meta.title,
        bookIndex: activeBookIndex,
        bookTitle: meta.title,
        completedTriples: newCompletedTriples,
        progressTimestamp: Date.now(),
        isCompleted: isBookCompleted,
      });
    }

    return null;
  },
});

/**
 * Returns book progress for all books (used by books-list screen).
 */
export const listProgress = query({
  args: {},
  returns: v.array(
    v.object({
      bookIndex: v.number(),
      isCompleted: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const progress = await ctx.db
      .query('bookProgress')
      .withIndex('by_user_and_book_index', (q) => q.eq('userId', user._id))
      .collect();

    return progress.map((item) => ({
      bookIndex: item.bookIndex,
      isCompleted: item.isCompleted,
    }));
  },
});
