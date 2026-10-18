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

export function isSameDayProgressRequired(minutes: DailyCommitmentMinutes) {
  return minutes === 10 || minutes === 15;
}

export function getRoutineWindows(minutes: DailyCommitmentMinutes): RoutineBlockId[][] {
  switch (minutes) {
    case 2:
      return ROUTINE_BLOCK_IDS.map((blockId) => [blockId]);
    case 5:
      return [
        ['noRep', 'bookSession1'],
        ['bookSession2', 'bookSession3'],
        ['drawings', 'mathSession1'],
        ['mathSession2'],
      ];
    case 10:
      return [
        ['noRep', 'bookSession1', 'bookSession2', 'bookSession3'],
        ['drawings', 'mathSession1', 'mathSession2'],
      ];
    case 15:
      return [Array.from(ROUTINE_BLOCK_IDS)];
  }
}

export function getActiveRoutineWindow(
  minutes: DailyCommitmentMinutes,
  completedWindowCount: number
) {
  const windows = getRoutineWindows(minutes);
  return windows[completedWindowCount % windows.length];
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
