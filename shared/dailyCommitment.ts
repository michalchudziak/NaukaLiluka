export const DAILY_COMMITMENT_OPTIONS = [2, 5, 10, 15] as const;

export type DailyCommitmentMinutes = (typeof DAILY_COMMITMENT_OPTIONS)[number];

export type OnboardingProfile = {
  childAgeMonths: number | null;
  dailyCommitmentMinutes: DailyCommitmentMinutes | null;
};

export const defaultOnboardingProfile: OnboardingProfile = {
  childAgeMonths: null,
  dailyCommitmentMinutes: null,
};

export const ROUTINE_BLOCK_IDS = [
  'noRep',
  'bookSession1',
  'bookSession2',
  'bookSession3',
  'drawings',
  'mathSession1',
  'mathSession2',
] as const;

export type RoutineBlockId = (typeof ROUTINE_BLOCK_IDS)[number];

export function isOnboardingProfileComplete(profile: OnboardingProfile) {
  return profile.childAgeMonths !== null && profile.childAgeMonths >= 0 && profile.dailyCommitmentMinutes !== null;
}

export type RoutineBlockCompletion = {
  blockId: RoutineBlockId;
  completedAt: number;
};

const DAILY_BLOCK_COUNTS: Record<DailyCommitmentMinutes, number> = {
  2: 1,
  5: 2,
  10: 4,
  15: ROUTINE_BLOCK_IDS.length,
};

export function getDailyBlockCount(minutes: DailyCommitmentMinutes) {
  return DAILY_BLOCK_COUNTS[minutes];
}

// Blocks rotate in a fixed order. Finishing a block sends it to the back of the
// queue, so unfinished blocks stay in front and carry over to the next day.
export function getTodayRoutineBlockIds(
  minutes: DailyCommitmentMinutes,
  lastCompletions: readonly RoutineBlockCompletion[],
  todayStartMs: number
): RoutineBlockId[] {
  const lastCompletedAt = new Map(
    lastCompletions.map((completion) => [completion.blockId, completion.completedAt])
  );
  const queue = [...ROUTINE_BLOCK_IDS].sort(
    (a, b) => (lastCompletedAt.get(a) ?? -1) - (lastCompletedAt.get(b) ?? -1)
  );
  const completedToday = queue.filter(
    (blockId) => (lastCompletedAt.get(blockId) ?? -1) >= todayStartMs
  );
  const pending = queue.filter((blockId) => (lastCompletedAt.get(blockId) ?? -1) < todayStartMs);
  const openSlots = Math.max(0, getDailyBlockCount(minutes) - completedToday.length);

  return [...pending.slice(0, openSlots), ...completedToday];
}

export function getNewlyCompletedRoutineBlockIds(
  minutes: DailyCommitmentMinutes,
  lastCompletions: readonly RoutineBlockCompletion[],
  todayStartMs: number,
  isBlockDone: Record<RoutineBlockId, boolean>
): RoutineBlockId[] {
  return getTodayRoutineBlockIds(minutes, lastCompletions, todayStartMs).filter(
    (blockId) =>
      isBlockDone[blockId] &&
      !lastCompletions.some(
        (completion) => completion.blockId === blockId && completion.completedAt >= todayStartMs
      )
  );
}

export function withRoutineBlockCompletions(
  lastCompletions: readonly RoutineBlockCompletion[],
  blockIds: readonly RoutineBlockId[],
  completedAt: number
): RoutineBlockCompletion[] {
  return [
    ...lastCompletions.filter((completion) => !blockIds.includes(completion.blockId)),
    ...blockIds.map((blockId) => ({ blockId, completedAt })),
  ];
}

export function getBookRoutineId(session: 'session1' | 'session2' | 'session3'): RoutineBlockId {
  switch (session) {
    case 'session1':
      return 'bookSession1';
    case 'session2':
      return 'bookSession2';
    case 'session3':
      return 'bookSession3';
  }
}

export function getMathRoutineId(session: 'session1' | 'session2'): RoutineBlockId {
  return session === 'session1' ? 'mathSession1' : 'mathSession2';
}
