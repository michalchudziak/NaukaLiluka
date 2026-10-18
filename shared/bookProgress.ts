export function resolveTripleIndex(
  completedTriples: number[],
  completedAt: number | undefined,
  todayStartMs: number,
  tripleCount: number,
  partialSessionTokens: readonly string[] = []
): number {
  // Older clients also wrote the timestamp on partial saves. Partial tokens
  // identify that case so those rows keep their current, incomplete set.
  if (
    partialSessionTokens.length === 0 &&
    completedAt != null &&
    completedAt >= todayStartMs &&
    completedTriples.length > 0
  ) {
    return completedTriples[completedTriples.length - 1];
  }

  for (let index = 0; index < tripleCount; index++) {
    if (!completedTriples.includes(index)) return index;
  }

  return Math.max(0, tripleCount - 1);
}
