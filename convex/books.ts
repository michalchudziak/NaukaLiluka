import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { resolveTripleIndex } from '../shared/bookProgress';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
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

type BookSessionName = 'session1' | 'session2' | 'session3';
type BookSessionToken =
  | 'session1:words'
  | 'session2:words'
  | 'session3:words'
  | 'session3:sentences';
type BooksCtx = QueryCtx | MutationCtx;
type BookProgressDoc = {
  _id: Id<'bookProgress'>;
  bookIndex: number;
  isCompleted: boolean;
  completedTriples: number[];
  currentTripleSessionCompletions?: BookSessionToken[];
  progressTimestamp: number;
};

function findActiveBook(allProgress: BookProgressDoc[]) {
  for (let i = 0; i < BOOK_METADATA.length; i++) {
    const prog = allProgress.find((progress) => progress.bookIndex === i);
    if (!prog?.isCompleted) {
      return { activeBookIndex: i, activeProgress: prog, allCompleted: false };
    }
  }

  return {
    activeBookIndex: 0,
    activeProgress: allProgress.find((progress) => progress.bookIndex === 0),
    allCompleted: true,
  };
}

function getBookSessionToken(
  session: BookSessionName,
  type: 'words' | 'sentences'
): BookSessionToken {
  if (session === 'session1') {
    return 'session1:words';
  }

  if (session === 'session2') {
    return 'session2:words';
  }

  return type === 'sentences' ? 'session3:sentences' : 'session3:words';
}

function getRequiredSessionTokens(hasSentences: boolean): BookSessionToken[] {
  return hasSentences
    ? ['session1:words', 'session2:words', 'session3:words', 'session3:sentences']
    : ['session1:words', 'session2:words', 'session3:words'];
}

export async function getResolvedBookStatus(
  ctx: BooksCtx,
  userId: Id<'users'>,
  todayStartMs: number
) {
  const allProgress = await ctx.db
    .query('bookProgress')
    .withIndex('by_user_and_book_index', (q) => q.eq('userId', userId))
    .collect();

  const { activeBookIndex, activeProgress, allCompleted } = findActiveBook(
    allProgress as BookProgressDoc[]
  );
  const meta = BOOK_METADATA[activeBookIndex];
  const completedTriples = activeProgress?.completedTriples ?? [];
  const currentTripleIndex = resolveTripleIndex(
    completedTriples,
    activeProgress?.progressTimestamp,
    todayStartMs,
    meta.tripleCount,
    activeProgress?.currentTripleSessionCompletions
  );
  const hasSentences = tripleHasSentences(activeBookIndex, currentTripleIndex);
  const requiredSessionTokens = getRequiredSessionTokens(hasSentences);
  const tripleCompletedToday =
    activeProgress?.progressTimestamp != null &&
    activeProgress.progressTimestamp >= todayStartMs &&
    completedTriples.includes(currentTripleIndex);
  // Sessions of an unfinished set are kept across days, so the set advances
  // once each of them was done, however the work is spread out.
  const completedSessionTokens = new Set<BookSessionToken>(
    tripleCompletedToday
      ? requiredSessionTokens
      : (activeProgress?.currentTripleSessionCompletions ?? [])
  );

  const sessions = {
    session1: {
      hasWords: true,
      hasSentences: false,
      isWordsCompleted: completedSessionTokens.has('session1:words'),
      isSentencesCompleted: false,
    },
    session2: {
      hasWords: true,
      hasSentences: false,
      isWordsCompleted: completedSessionTokens.has('session2:words'),
      isSentencesCompleted: false,
    },
    session3: {
      hasWords: true,
      hasSentences,
      isWordsCompleted: completedSessionTokens.has('session3:words'),
      isSentencesCompleted: completedSessionTokens.has('session3:sentences'),
    },
  };

  const isDayCompleted = requiredSessionTokens.every((token) => completedSessionTokens.has(token));

  return {
    activeBookIndex,
    activeBookTitle: meta.title,
    activeBookCompleted: allCompleted || (activeProgress?.isCompleted ?? false),
    currentTripleIndex,
    isDayCompleted,
    sessions,
  };
}

export const getTodayStatus = query({
  args: { todayStartMs: v.number() },
  returns: todayStatusValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    return await getResolvedBookStatus(ctx, user._id, args.todayStartMs);
  },
});

export const completeSession = mutation({
  args: {
    session: bookSessionNameValidator,
    type: contentTypeValidator,
    todayStartMs: v.number(),
    bookIndex: v.optional(v.number()),
    tripleIndex: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const allProgress = await ctx.db
      .query('bookProgress')
      .withIndex('by_user_and_book_index', (q) => q.eq('userId', user._id))
      .collect();
    const { activeBookIndex, activeProgress } = findActiveBook(allProgress as BookProgressDoc[]);
    const meta = BOOK_METADATA[activeBookIndex];
    const completedTriples = activeProgress?.completedTriples ?? [];
    const currentTripleIndex = resolveTripleIndex(
      completedTriples,
      activeProgress?.progressTimestamp,
      args.todayStartMs,
      meta.tripleCount,
      activeProgress?.currentTripleSessionCompletions
    );
    if (
      (args.bookIndex !== undefined && args.bookIndex !== activeBookIndex) ||
      (args.tripleIndex !== undefined && args.tripleIndex !== currentTripleIndex)
    )
      return null;

    if (completedTriples.includes(currentTripleIndex)) {
      return null;
    }

    const requiredSessionTokens = getRequiredSessionTokens(
      tripleHasSentences(activeBookIndex, currentTripleIndex)
    );
    const persistedTokens = new Set<BookSessionToken>(
      activeProgress?.currentTripleSessionCompletions ?? []
    );
    const newToken = getBookSessionToken(args.session, args.type);

    if (persistedTokens.has(newToken)) {
      return null;
    }

    persistedTokens.add(newToken);

    if (!requiredSessionTokens.every((token) => persistedTokens.has(token))) {
      const nextCompletedTokens = Array.from(persistedTokens);

      if (activeProgress) {
        await ctx.db.patch(activeProgress._id, {
          currentTripleSessionCompletions: nextCompletedTokens,
        });
      } else {
        await ctx.db.insert('bookProgress', {
          userId: user._id,
          bookKey: meta.title,
          bookIndex: activeBookIndex,
          bookTitle: meta.title,
          completedTriples: [],
          currentTripleSessionCompletions: nextCompletedTokens,
          progressTimestamp: 0,
          isCompleted: false,
        });
      }

      return null;
    }

    const newCompletedTriples = [...completedTriples, currentTripleIndex];
    const isBookCompleted = newCompletedTriples.length >= getRequiredDays(activeBookIndex);

    if (activeProgress) {
      await ctx.db.patch(activeProgress._id, {
        completedTriples: newCompletedTriples,
        currentTripleSessionCompletions: [] satisfies BookSessionToken[],
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
        currentTripleSessionCompletions: [] satisfies BookSessionToken[],
        progressTimestamp: Date.now(),
        isCompleted: isBookCompleted,
      });
    }

    return null;
  },
});

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
