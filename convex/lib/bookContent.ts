/**
 * Book metadata for server-side logic.
 * Keeps only structural info needed for progress tracking.
 * Actual word/sentence content stays client-side in content/books/.
 *
 * IMPORTANT: This array MUST stay in sync with content/books/index.ts.
 * Same order, same count, matching titles. If you add/remove/reorder books
 * in content/books/index.ts, update this array to match.
 */

export type BookMeta = {
  title: string;
  tripleCount: number;
  /** Per-triple flag: does this triple index have sentences? */
  sentenceFlags: boolean[];
};

export const BOOK_METADATA: BookMeta[] = [
  { title: 'Rodzina', tripleCount: 3, sentenceFlags: [false, true, true] },
  { title: 'Dom', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Ogród', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Las', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Wakacje', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Wycieczka do Zoo', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Obiad u dziadków', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Zakupy', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Plac zabaw', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Kuchnia', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Urodziny', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Spacer w parku', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Deszczowy dzień', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Wieczór z muzyką', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Piknik w parku', tripleCount: 3, sentenceFlags: [true, true, true] },
  { title: 'Rower w parku', tripleCount: 3, sentenceFlags: [true, true, true] },
];

/** Expected number of books — must match content/books/index.ts length. */
export const EXPECTED_BOOK_COUNT = BOOK_METADATA.length;

export function getRequiredDays(bookIndex: number): number {
  return BOOK_METADATA[bookIndex]?.tripleCount ?? 0;
}

export function tripleHasSentences(bookIndex: number, tripleIndex: number): boolean {
  return BOOK_METADATA[bookIndex]?.sentenceFlags[tripleIndex] ?? false;
}
