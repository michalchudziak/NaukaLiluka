import { isToday } from 'date-fns';
import { create } from 'zustand';
import { books } from '@/content/books';
import { HybridStorageService } from '@/services/hybrid-storage';

const STORAGE_KEYS = {
  BOOK_PROGRESS: 'progress.books',
  ROUTINES_BOOK_TRACK_SESSIONS: 'routines.reading.book-track.sessions',
} as const;

interface BookProgress {
  bookId: number;
  bookTitle: string;
  completedTriples: number[]; // indices completed when day fully done
  progressTimestamp: number;
  isCompleted: boolean;
}

interface BookTrackSessionCompletion {
  session: 'session1' | 'session2' | 'session3';
  type: 'words' | 'sentences';
  timestamp: number;
}

export interface SessionContent {
  words: string[];
  sentences: string[];
  isWordsCompleted: boolean;
  isSentencesCompleted: boolean;
}

export interface DailyData {
  timestamp: number;
  bookId: string;
  selectedWordTripleIndex: number;
  selectedSentenceTripleIndex: number;
  sessions: {
    session1: SessionContent;
    session2: SessionContent;
    session3: SessionContent;
  };
}

interface BookStore {
  activeBookProgress: BookProgress;
  completedSessions: BookTrackSessionCompletion[];

  getDailyData: () => DailyData;
  markSessionItemCompleted: (
    session: 'session1' | 'session2' | 'session3',
    type: 'words' | 'sentences'
  ) => void;
  isDayCompleted: () => boolean;
  isSessionItemCompletedToday: (
    session: 'session1' | 'session2' | 'session3',
    type: 'words' | 'sentences'
  ) => boolean;
  hydrate: () => Promise<void>;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getUniquePermutations<T>(array: T[]): T[][] {
  // For a 3-element array, generate 3 guaranteed different permutations
  if (array.length !== 3) {
    // Fallback for non-3-element arrays
    return [array, shuffleArray(array), shuffleArray(array)];
  }

  // Generate 3 guaranteed unique permutations for 3 elements
  const permutations: T[][] = [
    [array[0], array[1], array[2]], // Original order
    [array[1], array[2], array[0]], // Rotate left
    [array[2], array[0], array[1]], // Rotate left twice
  ];

  // Randomly shuffle which permutation goes to which session
  return shuffleArray(permutations);
}

export const useBookStore = create<BookStore>((set, get) => ({
  activeBookProgress: {
    bookId: 0,
    bookTitle: books[0]?.book.title || 'Unknown',
    completedTriples: [],
    progressTimestamp: 0,
    isCompleted: false,
  },
  completedSessions: [],

  getDailyData: () => {
    const state = get();

    // Determine active book progress (first not completed book)
    const active = state.activeBookProgress;
    const bookIndex = active.bookId;
    const chosenBook = books[bookIndex];

    // Fallback in case of out-of-bounds
    if (!chosenBook) {
      return {
        timestamp: Date.now(),
        bookId: 'N/A',
        selectedWordTripleIndex: 0,
        selectedSentenceTripleIndex: 0,
        sessions: {
          session1: {
            words: [],
            sentences: [],
            isWordsCompleted: false,
            isSentencesCompleted: false,
          },
          session2: {
            words: [],
            sentences: [],
            isWordsCompleted: false,
            isSentencesCompleted: false,
          },
          session3: {
            words: [],
            sentences: [],
            isWordsCompleted: false,
            isSentencesCompleted: false,
          },
        },
      };
    }

    const wordsTriples = chosenBook.words;
    const sentencesTriples = chosenBook.sentences;

    // Decide which triple index to use for both words and sentences
    const today = new Date();
    const reuseToday = !!active.progressTimestamp && isToday(active.progressTimestamp);
    const nextTripleIndex = (() => {
      if (reuseToday && active.completedTriples.length > 0) {
        // Reuse last completed triple for today
        return active.completedTriples[active.completedTriples.length - 1];
      }
      const maxLen = Math.max(wordsTriples.length, sentencesTriples.length);
      for (let i = 0; i < maxLen; i++) {
        if (!active.completedTriples.includes(i)) return i;
      }
      // if everything is completed, stick to the last one
      return Math.max(0, maxLen - 1);
    })();

    // Build session content. Words appear in all three sessions with different orderings.
    const wordTriple = wordsTriples[nextTripleIndex] || [];
    const sentenceTriple = sentencesTriples[nextTripleIndex] || [];
    const permutations = getUniquePermutations(wordTriple);

    const todays = state.completedSessions.filter((c) => isToday(c.timestamp));

    const makeFlags = (session: 'session1' | 'session2' | 'session3') => ({
      isWordsCompleted: todays.some((c) => c.session === session && c.type === 'words'),
      isSentencesCompleted: todays.some((c) => c.session === session && c.type === 'sentences'),
    });

    return {
      timestamp: today.getTime(),
      bookId: chosenBook.book.title,
      selectedWordTripleIndex: nextTripleIndex,
      selectedSentenceTripleIndex: nextTripleIndex,
      sessions: {
        session1: {
          words: permutations[0] || [],
          sentences: [],
          ...makeFlags('session1'),
        },
        session2: {
          words: permutations[1] || [],
          sentences: [],
          ...makeFlags('session2'),
        },
        session3: {
          words: permutations[2] || [],
          sentences: sentenceTriple || [],
          ...makeFlags('session3'),
        },
      },
    };
  },

  markSessionItemCompleted: (session, type) => {
    const prev = get().completedSessions;
    const already = prev.some(
      (c) => c.session === session && c.type === type && isToday(c.timestamp)
    );
    if (!already) {
      const updated = [...prev, { session, type, timestamp: Date.now() }];
      set({ completedSessions: updated });
      HybridStorageService.writeBookTrackSessions(
        STORAGE_KEYS.ROUTINES_BOOK_TRACK_SESSIONS,
        updated
      );
    }

    // Update book progress after marking
    const daily = get().getDailyData();
    const active = get().activeBookProgress;
    const book = books[active.bookId];
    if (!book) return;

    const nextState = { ...active };

    // Only mark the triple as completed when the full day is completed
    const dayCompleted = get().isDayCompleted();
    if (dayCompleted && !nextState.completedTriples.includes(daily.selectedWordTripleIndex)) {
      nextState.completedTriples = [...nextState.completedTriples, daily.selectedWordTripleIndex];
      // Do not update any other fields when partial; progressTimestamp intentionally unchanged on partials
      nextState.progressTimestamp = Date.now();
    }

    // Determine if book is completed (count only non-empty triples)
    const requiredDays = (() => {
      const maxLen = Math.max(book.words.length, book.sentences.length);
      let count = 0;
      for (let i = 0; i < maxLen; i++) {
        const hasWords = (book.words[i]?.length || 0) > 0;
        const hasSentences = (book.sentences[i]?.length || 0) > 0;
        if (hasWords || hasSentences) count++;
      }
      return count;
    })();
    nextState.isCompleted = (nextState.completedTriples.length || 0) >= requiredDays;

    set({ activeBookProgress: nextState });

    // Persist full progress list: we store one record per book in storage
    // Read existing progress, merge/replace current, save back
    (async () => {
      const stored: BookProgress[] =
        (await HybridStorageService.readBookProgress(STORAGE_KEYS.BOOK_PROGRESS)) || [];
      // Ensure progress for all books exists
      const merged: BookProgress[] = books.map((b, idx) => {
        const found = stored.find((p: any) => p.bookId === idx || p.bookTitle === b.book.title);
        if (found && (found.bookId === idx || found.bookTitle === b.book.title)) {
          // Normalize shape
          return {
            bookId: typeof found.bookId === 'number' ? found.bookId : idx,
            bookTitle: found.bookTitle || b.book.title,
            completedTriples: (found.completedTriples || []) as number[],
            progressTimestamp: found.progressTimestamp || 0,
            isCompleted: !!found.isCompleted,
          };
        }
        return {
          bookId: idx,
          bookTitle: b.book.title,
          completedTriples: [],
          progressTimestamp: 0,
          isCompleted: false,
        };
      });

      merged[nextState.bookId] = nextState;

      await HybridStorageService.writeBookProgress(STORAGE_KEYS.BOOK_PROGRESS, merged);

      // If current became completed, we could move to next book for future sessions
      if (nextState.isCompleted) {
        const nextIndex = merged.findIndex((p) => !p.isCompleted);
        if (nextIndex !== -1) {
          set({ activeBookProgress: merged[nextIndex] });
        }
      }
    })();
  },

  isDayCompleted: () => {
    const daily = get().getDailyData();
    const todays = get().completedSessions.filter((c) => isToday(c.timestamp));
    const required: {
      session: 'session1' | 'session2' | 'session3';
      type: 'words' | 'sentences';
    }[] = [
      { session: 'session1', type: 'words' },
      { session: 'session2', type: 'words' },
      { session: 'session3', type: 'words' },
    ];
    if ((daily.sessions.session3.sentences?.length || 0) > 0) {
      required.push({ session: 'session3', type: 'sentences' });
    }
    return required.every((r) => todays.some((c) => c.session === r.session && c.type === r.type));
  },

  isSessionItemCompletedToday: (session, type) => {
    const todays = get().completedSessions.filter((c) => isToday(c.timestamp));
    return todays.some((c) => c.session === session && c.type === type);
  },

  hydrate: async () => {
    await HybridStorageService.initialize();

    // Load completions
    const completions =
      (await HybridStorageService.readBookTrackSessions(
        STORAGE_KEYS.ROUTINES_BOOK_TRACK_SESSIONS
      )) || [];

    // Load progress list and resolve active book
    const stored: BookProgress[] =
      (await HybridStorageService.readBookProgress(STORAGE_KEYS.BOOK_PROGRESS)) || [];
    const progressList: BookProgress[] = books.map((b, idx) => {
      const found = stored.find((p) => p.bookId === idx || p.bookTitle === b.book.title);
      if (found) {
        return {
          bookId: typeof found.bookId === 'number' ? found.bookId : idx,
          bookTitle: found.bookTitle || b.book.title,
          completedTriples: (found.completedTriples || []) as number[],
          progressTimestamp: found.progressTimestamp || 0,
          isCompleted: !!found.isCompleted,
        };
      }
      return {
        bookId: idx,
        bookTitle: b.book.title,
        completedTriples: [],
        progressTimestamp: 0,
        isCompleted: false,
      };
    });

    // Determine which books are completed based on current content lengths (normalize)
    for (const p of progressList) {
      const book = books[p.bookId];
      if (!book) continue;
      const requiredDays = (() => {
        const maxLen = Math.max(book.words.length, book.sentences.length);
        let count = 0;
        for (let i = 0; i < maxLen; i++) {
          const hasWords = (book.words[i]?.length || 0) > 0;
          const hasSentences = (book.sentences[i]?.length || 0) > 0;
          if (hasWords || hasSentences) count++;
        }
        return count;
      })();
      p.isCompleted = (p.completedTriples?.length || 0) >= requiredDays;
    }

    const active = progressList.find((p) => !p.isCompleted) || progressList[0];

    set({ activeBookProgress: active, completedSessions: completions });
  },
}));
