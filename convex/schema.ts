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
  settings: defineTable({
    key: v.literal('default'),
    snapshot: settingsSnapshotValidator,
  }).index('by_key', ['key']),

  bookProgress: defineTable({
    bookKey: v.string(),
    bookIndex: v.number(),
    bookTitle: v.string(),
    completedTriples: v.array(v.number()),
    progressTimestamp: v.number(),
    isCompleted: v.boolean(),
  })
    .index('by_book_key', ['bookKey'])
    .index('by_book_index', ['bookIndex']),

  bookTrackSessions: defineTable({
    sessionName: v.union(v.literal('session1'), v.literal('session2'), v.literal('session3')),
    contentType: contentTypeValidator,
    completedAt: v.number(),
  }).index('by_completed_at', ['completedAt']),

  dailyPlans: defineTable({
    bookId: v.string(),
    selectedWordTripleIndex: v.number(),
    selectedSentenceTripleIndex: v.number(),
    session1Content: bookDailySessionContentValidator,
    session2Content: bookDailySessionContentValidator,
    session3Content: bookDailySessionContentValidator,
    createdAt: v.number(),
  }).index('by_created_at', ['createdAt']),

  noRepProgress: defineTable({
    contentType: contentTypeValidator,
    displayedItems: v.array(v.string()),
  }).index('by_content_type', ['contentType']),

  noRepCompletions: defineTable({
    contentType: contentTypeValidator,
    completedAt: v.number(),
  }).index('by_content_type_and_completed_at', ['contentType', 'completedAt']),

  drawingPresentations: defineTable({
    setTitle: v.string(),
    presentedAt: v.number(),
  }).index('by_presented_at', ['presentedAt']),

  mathProgress: defineTable({
    key: v.literal('default'),
    currentDay: v.number(),
    lastSessionDate: v.union(v.string(), v.null()),
    completedSessions: v.array(mathSessionValidator),
  }).index('by_key', ['key']),

  mathSessionCompletions: defineTable({
    sessionType: mathSessionValidator,
    dayNumber: v.number(),
    completedAt: v.number(),
  }).index('by_completed_at', ['completedAt']),

  equationsProgress: defineTable({
    key: v.literal('default'),
    currentDay: v.number(),
    currentCategory: equationCategoryValidator,
    lastSessionDate: v.union(v.string(), v.null()),
    completedSessions: v.array(equationSessionValidator),
  }).index('by_key', ['key']),

  equationsSessionCompletions: defineTable({
    sessionType: equationSessionValidator,
    category: equationCategoryValidator,
    dayNumber: v.number(),
    completedAt: v.number(),
  }).index('by_completed_at', ['completedAt']),
});
