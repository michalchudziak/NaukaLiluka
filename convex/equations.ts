import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { requireCurrentUser } from './lib/current_user';
import { defaultSettings } from './settingsSnapshot';
import {
  defaultEquationsProgress,
  equationCategoryValidator,
  equationSessionValidator,
} from './validators';
import { isSameDayProgressRequired } from '../shared/dailyCommitment';

type EquationSession = 'subitizing1' | 'subitizing2' | 'equations1' | 'equations2';
type EquationCategory = 'integer' | 'fraction' | 'decimal' | 'negative' | 'percentage';
type StoredEquationsProgress = {
  currentDay: number;
  currentCategory: EquationCategory;
  lastSessionDate: string | null;
  completedSessions: EquationSession[];
};
type EquationsCtx = QueryCtx | MutationCtx;

const equationsStatusValidator = v.object({
  currentDay: v.number(),
  currentCategory: equationCategoryValidator,
  completedSessionsToday: v.array(equationSessionValidator),
  isDayCompleted: v.boolean(),
  sessions: v.object({
    session1: v.boolean(),
    session2: v.boolean(),
  }),
});

const CATEGORY_ORDER: EquationCategory[] = [
  'integer',
  'fraction',
  'decimal',
  'negative',
  'percentage',
];
const CATEGORY_DURATIONS: Record<EquationCategory, number> = {
  integer: 5,
  fraction: 6,
  decimal: 6,
  negative: 6,
  percentage: 6,
};

const isProgressFromToday = (lastSessionDate: string | null, todayStartMs: number) =>
  lastSessionDate !== null && Date.parse(lastSessionDate) >= todayStartMs;

const nextDayAndCategory = (
  day: number,
  category: EquationCategory
): { day: number; category: EquationCategory } => {
  const maxDays = CATEGORY_DURATIONS[category];

  if (day < maxDays) {
    return { day: day + 1, category };
  }

  const idx = CATEGORY_ORDER.indexOf(category);
  const nextCategory = CATEGORY_ORDER[(idx + 1) % CATEGORY_ORDER.length];
  return { day: 1, category: nextCategory };
};

const getSessionGroupsForDay = (day: number, category: EquationCategory): EquationSession[][] => {
  const includeSubitizing =
    (category === 'integer' && day === 1) || (category !== 'integer' && day === 2);

  if (includeSubitizing) {
    return [
      ['subitizing1', 'equations1'],
      ['subitizing2', 'equations2'],
    ];
  }

  return [['equations1'], ['equations2']];
};

const areAllRequiredSessionsCompleted = (
  sessionGroups: EquationSession[][],
  completedSessions: EquationSession[]
) => sessionGroups.flat().every((session) => completedSessions.includes(session));

async function getEquationsSettingsSnapshot(ctx: EquationsCtx, userId: Id<'users'>) {
  const settings = await ctx.db
    .query('settings')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();

  return settings?.snapshot ?? defaultSettings;
}

export function resolveEquationsStatus(
  progress: StoredEquationsProgress,
  todayStartMs: number,
  sameDayRequired: boolean
) {
  const progressIsFromToday = isProgressFromToday(progress.lastSessionDate, todayStartMs);
  const previousDayGroups = getSessionGroupsForDay(progress.currentDay, progress.currentCategory);
  const previousDayCompleted = areAllRequiredSessionsCompleted(
    previousDayGroups,
    progress.completedSessions
  );
  const shouldAdvanceDay = progress.lastSessionDate !== null && !progressIsFromToday && previousDayCompleted;
  const nextProgress = shouldAdvanceDay
    ? nextDayAndCategory(progress.currentDay, progress.currentCategory)
    : { day: progress.currentDay, category: progress.currentCategory };
  const completedSessionsToday = shouldAdvanceDay
    ? []
    : sameDayRequired
      ? progressIsFromToday
        ? progress.completedSessions
        : []
      : progress.completedSessions;
  const sessionGroups = getSessionGroupsForDay(nextProgress.day, nextProgress.category);

  return {
    currentDay: nextProgress.day,
    currentCategory: nextProgress.category,
    completedSessionsToday,
    sessionGroups,
  };
}

export async function getResolvedEquationsStatus(
  ctx: EquationsCtx,
  userId: Id<'users'>,
  todayStartMs: number,
  sameDayRequired: boolean
) {
  const progress = await ctx.db
    .query('equationsProgress')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();
  const storedProgress: StoredEquationsProgress = progress
    ? {
        currentDay: progress.currentDay,
        currentCategory: progress.currentCategory,
        lastSessionDate: progress.lastSessionDate,
        completedSessions: progress.completedSessions,
      }
    : {
        currentDay: defaultEquationsProgress.currentDay,
        currentCategory: 'integer',
        lastSessionDate: defaultEquationsProgress.lastSessionDate,
        completedSessions: defaultEquationsProgress.completedSessions,
      };
  const effectiveProgress = resolveEquationsStatus(
    storedProgress,
    todayStartMs,
    sameDayRequired
  );
  const [session1, session2] = effectiveProgress.sessionGroups;

  return {
    currentDay: effectiveProgress.currentDay,
    currentCategory: effectiveProgress.currentCategory,
    completedSessionsToday: effectiveProgress.completedSessionsToday,
    isDayCompleted: areAllRequiredSessionsCompleted(
      effectiveProgress.sessionGroups,
      effectiveProgress.completedSessionsToday
    ),
    sessions: {
      session1: areAllRequiredSessionsCompleted(
        [session1],
        effectiveProgress.completedSessionsToday
      ),
      session2: areAllRequiredSessionsCompleted(
        [session2],
        effectiveProgress.completedSessionsToday
      ),
    },
  };
}

export const getStatus = query({
  args: {
    todayStartMs: v.number(),
  },
  returns: equationsStatusValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const settingsSnapshot = await getEquationsSettingsSnapshot(ctx, user._id);
    const sameDayRequired = isSameDayProgressRequired(
      settingsSnapshot.onboarding.dailyCommitmentMinutes ?? 15
    );

    return await getResolvedEquationsStatus(ctx, user._id, args.todayStartMs, sameDayRequired);
  },
});

export const completeSession = mutation({
  args: {
    session: equationSessionValidator,
    todayStartMs: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const settingsSnapshot = await getEquationsSettingsSnapshot(ctx, user._id);
    const sameDayRequired = isSameDayProgressRequired(
      settingsSnapshot.onboarding.dailyCommitmentMinutes ?? 15
    );
    const existing = await ctx.db
      .query('equationsProgress')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();
    const storedProgress: StoredEquationsProgress = existing
      ? {
          currentDay: existing.currentDay,
          currentCategory: existing.currentCategory,
          lastSessionDate: existing.lastSessionDate,
          completedSessions: existing.completedSessions,
        }
      : {
          currentDay: defaultEquationsProgress.currentDay,
          currentCategory: 'integer',
          lastSessionDate: defaultEquationsProgress.lastSessionDate,
          completedSessions: defaultEquationsProgress.completedSessions,
        };
    const effectiveProgress = resolveEquationsStatus(
      storedProgress,
      args.todayStartMs,
      sameDayRequired
    );

    if (effectiveProgress.completedSessionsToday.includes(args.session)) {
      return null;
    }

    const nextProgress = {
      currentDay: effectiveProgress.currentDay,
      currentCategory: effectiveProgress.currentCategory,
      lastSessionDate: new Date().toISOString(),
      completedSessions: [...effectiveProgress.completedSessionsToday, args.session],
    };

    if (existing) {
      await ctx.db.patch(existing._id, nextProgress);
    } else {
      await ctx.db.insert('equationsProgress', {
        userId: user._id,
        ...nextProgress,
      });
    }

    return null;
  },
});
