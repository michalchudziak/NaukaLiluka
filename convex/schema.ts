import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  bookDailySessionContentValidator,
  contentTypeValidator,
  equationCategoryValidator,
  equationSessionValidator,
  mathSessionValidator,
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
    progressTimestamp: v.number(),
    isCompleted: v.boolean(),
  })
    .index('by_user_and_book_key', ['userId', 'bookKey'])
    .index('by_user_and_book_index', ['userId', 'bookIndex']),

  bookTrackSessions: defineTable({
    userId: v.id('users'),
    sessionName: v.union(v.literal('session1'), v.literal('session2'), v.literal('session3')),
    contentType: contentTypeValidator,
    completedAt: v.number(),
  }).index('by_user_and_completed_at', ['userId', 'completedAt']),

  dailyPlans: defineTable({
    userId: v.id('users'),
    bookId: v.string(),
    selectedWordTripleIndex: v.number(),
    selectedSentenceTripleIndex: v.number(),
    session1Content: bookDailySessionContentValidator,
    session2Content: bookDailySessionContentValidator,
    session3Content: bookDailySessionContentValidator,
    createdAt: v.number(),
  }).index('by_user_and_created_at', ['userId', 'createdAt']),

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

  mathSessionCompletions: defineTable({
    userId: v.id('users'),
    sessionType: mathSessionValidator,
    dayNumber: v.number(),
    completedAt: v.number(),
  }).index('by_user_and_completed_at', ['userId', 'completedAt']),

  equationsProgress: defineTable({
    userId: v.id('users'),
    currentDay: v.number(),
    currentCategory: equationCategoryValidator,
    lastSessionDate: v.union(v.string(), v.null()),
    completedSessions: v.array(equationSessionValidator),
  }).index('by_user', ['userId']),

  equationsSessionCompletions: defineTable({
    userId: v.id('users'),
    sessionType: equationSessionValidator,
    category: equationCategoryValidator,
    dayNumber: v.number(),
    completedAt: v.number(),
  }).index('by_user_and_completed_at', ['userId', 'completedAt']),
});
