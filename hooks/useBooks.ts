import { useMutation, useQuery } from 'convex/react';
import { startOfDay } from 'date-fns';
import { books } from '@/content/books';
import { api } from '@/convex/_generated/api';
import { EXPECTED_BOOK_COUNT } from '@/convex/lib/bookContent';

if (books.length !== EXPECTED_BOOK_COUNT) {
  throw new Error(
    `Book count mismatch: content/books has ${books.length} books but BOOK_METADATA expects ${EXPECTED_BOOK_COUNT}. Update convex/lib/bookContent.ts to match.`
  );
}

function rotateArray<T>(array: T[], times: number): T[] {
  if (array.length === 0) return array;
  const n = times % array.length;
  return [...array.slice(n), ...array.slice(0, n)];
}

export function useBookStatus() {
  const todayStartMs = startOfDay(new Date()).getTime();
  return useQuery(api.books.getTodayStatus, { todayStartMs });
}

export function useBookDailyContent() {
  const status = useBookStatus();

  if (!status) return null;

  const book = books[status.activeBookIndex];
  if (!book) return null;

  const words = book.words[status.currentTripleIndex] ?? [];
  const sentences = book.sentences[status.currentTripleIndex] ?? [];

  return {
    ...status,
    content: {
      session1: { words: rotateArray(words, 0), sentences: [] as string[] },
      session2: { words: rotateArray(words, 1), sentences: [] as string[] },
      session3: { words: rotateArray(words, 2), sentences },
    },
  };
}

export function useCompleteBookSession() {
  const todayStartMs = startOfDay(new Date()).getTime();
  const mutate = useMutation(api.books.completeSession);
  return (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') =>
    mutate({ session, type, todayStartMs });
}

export function useBookListProgress() {
  return useQuery(api.books.listProgress);
}
