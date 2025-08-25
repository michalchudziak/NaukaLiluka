import { books } from '@/content/books';
import { AsyncStorageService } from '@/services/async-storage';
import { create } from 'zustand';

const STORAGE_KEYS = {
  BOOK_PROGRESS: 'progress.books',
  DAILY_PLAN: 'progress.books.daily-plan',
} as const;

interface BookProgress {
  bookId: string;
  completedWordTriples: number[]; // indices of completed word triples
  completedSentenceTriples: number[]; // indices of completed sentence triples
  isCompleted: boolean;
}

interface SessionContent {
  words: string[];
  sentences: string[];
  isWordsCompleted: boolean;
  isSentencesCompleted: boolean;
}

interface DailyPlan {
  date: string;
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
  bookProgress: BookProgress[];
  dailyPlan: DailyPlan | null;
  
  initializeBookProgress: () => void;
  updateBookProgress: (bookId: string, wordTripleIndex: number, sentenceTripleIndex: number) => void;
  getDailyContent: () => Promise<DailyPlan | null>;
  markSessionItemCompleted: (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') => void;
  hydrate: () => Promise<void>;
  clearDailyPlan: () => void;
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

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export const useBookStore = create<BookStore>((set, get) => ({
  bookProgress: [],
  dailyPlan: null,
  
  initializeBookProgress: () => {
    const currentProgress = get().bookProgress;
    
    const updatedProgress = books.map(book => {
      const existing = currentProgress.find(p => p.bookId === book.book.title);
      if (existing) return existing;
      
      return {
        bookId: book.book.title,
        completedWordTriples: [],
        completedSentenceTriples: [],
        isCompleted: false,
      };
    });
    
    set({ bookProgress: updatedProgress });
    AsyncStorageService.write(STORAGE_KEYS.BOOK_PROGRESS, updatedProgress);
  },
  
  updateBookProgress: (bookId: string, wordTripleIndex: number, sentenceTripleIndex: number) => {
    const currentProgress = get().bookProgress;
    const book = books.find(b => b.book.title === bookId);
    
    if (!book) return;
    
    const updatedProgress = currentProgress.map(progress => {
      if (progress.bookId !== bookId) return progress;
      
      const updatedCompletedWordTriples = Array.from(new Set([...progress.completedWordTriples, wordTripleIndex]));
      const updatedCompletedSentenceTriples = Array.from(new Set([...progress.completedSentenceTriples, sentenceTripleIndex]));
      
      // Check if all triples are completed
      const totalWordTriples = book.words.length;
      const totalSentenceTriples = book.sentences.length;
      
      const isCompleted = 
        updatedCompletedWordTriples.length >= totalWordTriples &&
        updatedCompletedSentenceTriples.length >= totalSentenceTriples;
      
      return {
        ...progress,
        completedWordTriples: updatedCompletedWordTriples,
        completedSentenceTriples: updatedCompletedSentenceTriples,
        isCompleted,
      };
    });
    
    set({ bookProgress: updatedProgress });
    AsyncStorageService.write(STORAGE_KEYS.BOOK_PROGRESS, updatedProgress);
  },
  
  getDailyContent: async () => {
    const state = get();
    const today = getToday();
    
    // Check if we already have a plan for today
    if (state.dailyPlan && state.dailyPlan.date === today) {
      return state.dailyPlan;
    }
    
    // Initialize book progress if needed
    if (state.bookProgress.length === 0) {
      state.initializeBookProgress();
    }
    
    // Find the first not completed book
    const activeBookProgress = state.bookProgress.find(p => !p.isCompleted);
    if (!activeBookProgress) {
      return null; // All books completed
    }
    
    const activeBook = books.find(b => b.book.title === activeBookProgress.bookId);
    if (!activeBook) {
      return null;
    }
    
    // Find first uncompleted word triple and sentence triple
    let selectedWordTripleIndex = -1;
    let selectedSentenceTripleIndex = -1;
    
    // Find first uncompleted word triple
    for (let i = 0; i < activeBook.words.length; i++) {
      if (!activeBookProgress.completedWordTriples.includes(i)) {
        selectedWordTripleIndex = i;
        break;
      }
    }
    
    // Find first uncompleted sentence triple
    for (let i = 0; i < activeBook.sentences.length; i++) {
      if (!activeBookProgress.completedSentenceTriples.includes(i)) {
        selectedSentenceTripleIndex = i;
        break;
      }
    }
    
    if (selectedWordTripleIndex === -1 || selectedSentenceTripleIndex === -1) {
      // Mark book as completed if no more content
      state.updateBookProgress(activeBookProgress.bookId, -1, -1);
      return state.getDailyContent(); // Recursively try next book
    }
    
    const selectedWords = activeBook.words[selectedWordTripleIndex];
    const selectedSentences = activeBook.sentences[selectedSentenceTripleIndex];
    
    // Create sessions with guaranteed unique permutations of the same words
    const wordPermutations = getUniquePermutations(selectedWords);
    const session1Words = wordPermutations[0];
    const session2Words = wordPermutations[1];
    const session3Words = wordPermutations[2];
    
    const dailyPlan: DailyPlan = {
      date: today,
      bookId: activeBookProgress.bookId,
      selectedWordTripleIndex,
      selectedSentenceTripleIndex,
      sessions: {
        session1: {
          words: session1Words, // Unique permutation 1
          sentences: [], // No sentences in session 1
          isWordsCompleted: false,
          isSentencesCompleted: true, // No sentences to complete
        },
        session2: {
          words: session2Words, // Unique permutation 2
          sentences: [], // No sentences in session 2
          isWordsCompleted: false,
          isSentencesCompleted: true, // No sentences to complete
        },
        session3: {
          words: session3Words, // Unique permutation 3
          sentences: selectedSentences, // Sentences not shuffled
          isWordsCompleted: false,
          isSentencesCompleted: false,
        },
      },
    };
    
    // Mark the selected triples as completed in book progress
    state.updateBookProgress(activeBookProgress.bookId, selectedWordTripleIndex, selectedSentenceTripleIndex);
    
    set({ dailyPlan });
    AsyncStorageService.write(STORAGE_KEYS.DAILY_PLAN, dailyPlan);
    
    return dailyPlan;
  },
  
  markSessionItemCompleted: (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') => {
    const currentPlan = get().dailyPlan;
    if (!currentPlan) return;
    
    const updatedPlan = {
      ...currentPlan,
      sessions: {
        ...currentPlan.sessions,
        [session]: {
          ...currentPlan.sessions[session],
          [type === 'words' ? 'isWordsCompleted' : 'isSentencesCompleted']: true,
        },
      },
    };
    
    set({ dailyPlan: updatedPlan });
    AsyncStorageService.write(STORAGE_KEYS.DAILY_PLAN, updatedPlan);
  },
  
  hydrate: async () => {
    const [storedProgress, storedPlan] = await Promise.all([
      AsyncStorageService.read(STORAGE_KEYS.BOOK_PROGRESS),
      AsyncStorageService.read(STORAGE_KEYS.DAILY_PLAN),
    ]);
    
    const state: Partial<BookStore> = {};
    
    if (storedProgress) {
      state.bookProgress = storedProgress;
    } else {
      // Initialize if no stored progress
      get().initializeBookProgress();
    }
    
    if (storedPlan) {
      const today = getToday();
      // Only use stored plan if it's for today
      if (storedPlan.date === today) {
        state.dailyPlan = storedPlan;
      }
    }
    
    if (Object.keys(state).length > 0) {
      set(state);
    }
  },
  
  clearDailyPlan: () => {
    set({ dailyPlan: null });
    AsyncStorageService.clear(STORAGE_KEYS.DAILY_PLAN);
  },
}));