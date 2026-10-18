import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  bookSessionTokenValidator,
  contentTypeValidator,
  equationCategoryValidator,
  equationSessionValidator,
  mathSessionValidator,
  routineBlockIdValidator,
  settingsSnapshotValidator,
} from './validators';

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_token_identifier', ['tokenIdentifier']),

  settings: defineTable({
    userId: v.id('users'),
    snapshot: settingsSnapshotValidator,
  }).index('by_user', ['userId']),

  bookProgress: defineTable({
    userId: v.id('users'),
    bookKey: v.string(),
    bookIndex: v.number(),
    bookTitle: v.string(),
    completedTriples: v.array(v.number()),
    currentTripleSessionCompletions: v.optional(v.array(bookSessionTokenValidator)),
    progressTimestamp: v.number(),
    isCompleted: v.boolean(),
  }).index('by_user_and_book_index', ['userId', 'bookIndex']),

  routineProgress: defineTable({
    userId: v.id('users'),
    // Start of the local day on which tracking began; earlier no-rep
    // completions never count toward the routine.
    trackingStartMs: v.number(),
    lastCompletions: v.array(
      v.object({
        blockId: routineBlockIdValidator,
        completedAt: v.number(),
      })
    ),
  }).index('by_user', ['userId']),

  noRepProgress: defineTable({
    userId: v.id('users'),
    contentType: contentTypeValidator,
    displayedItems: v.array(v.string()),
  }).index('by_user_and_content_type', ['userId', 'contentType']),

  noRepCompletions: defineTable({
    userId: v.id('users'),
    contentType: contentTypeValidator,
    completedAt: v.number(),
  }).index('by_user_and_content_type_and_completed_at', ['userId', 'contentType', 'completedAt']),

  drawingPresentations: defineTable({
    userId: v.id('users'),
    setTitle: v.string(),
    presentedAt: v.number(),
  }).index('by_user_and_presented_at', ['userId', 'presentedAt']),

  mathProgress: defineTable({
    userId: v.id('users'),
    currentDay: v.number(),
    lastSessionDate: v.union(v.string(), v.null()),
    completedSessions: v.array(mathSessionValidator),
  }).index('by_user', ['userId']),

  equationsProgress: defineTable({
    userId: v.id('users'),
    currentDay: v.number(),
    currentCategory: equationCategoryValidator,
    lastSessionDate: v.union(v.string(), v.null()),
    completedSessions: v.array(equationSessionValidator),
  }).index('by_user', ['userId']),
});
