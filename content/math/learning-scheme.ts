export type SessionContent = {
  type: 'subitizing' | 'numbers';
  isOrdered: boolean;
};

export type DailyData = {
  activeDay: number;
  numbers: number[];
  sessionContent: SessionContent[][];
};

export const getNumbersLearningScheme = (day: number): DailyData => {
  if (day > 30) {
    return {
      activeDay: day,
      numbers: Array.from({ length: 10 }, () => Math.floor(Math.random() * 150)).sort(
        () => Math.random() - 0.5
      ),
      sessionContent: [
        [
          { type: 'subitizing', isOrdered: true },
          { type: 'numbers', isOrdered: true },
        ],
        [
          { type: 'subitizing', isOrdered: false },
          { type: 'numbers', isOrdered: false },
        ],
      ],
    };
  }

  if (day > 15) {
    return {
      activeDay: day,
      numbers: Array.from({ length: 10 }, (_, i) => i + (day - 16) * 10),
      sessionContent: [
        [
          { type: 'subitizing', isOrdered: true },
          { type: 'numbers', isOrdered: true },
        ],
        [{ type: 'numbers', isOrdered: false }],
      ],
    };
  }

  return {
    activeDay: day,
    numbers: Array.from({ length: 10 }, (_, i) => i + (day - 1) * 10),
    sessionContent: [
      [{ type: 'subitizing', isOrdered: true }],
      [{ type: 'subitizing', isOrdered: false }],
    ],
  };
};
