import { books } from '@/content/books';
import { HybridStorageService } from '@/services/hybrid-storage';
import { isToday } from 'date-fns';
import { create } from 'zustand';


const STORAGE_KEYS = {
  BOOK_PROGRESS: 'progress.books',
  DAILY_PLAN: 'progress.books.daily-plan',
  ROUTINES_BOOK_TRACK_SESSIONS: 'routines.reading.book-track.sessions',
} as const;

interface BookProgress {
  bookId: string;
  completedWordTriples: number[]; // indices of completed word triples
  completedSentenceTriples: number[]; // indices of completed sentence triples
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

export interface DailyPlan {
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
  bookProgress: BookProgress[];
  dailyPlan: DailyPlan | null;
  bookTrackSessionCompletions: BookTrackSessionCompletion[];
  
  initializeBookProgress: () => void;
  updateBookProgress: (bookId: string, wordTripleIndex: number, sentenceTripleIndex: number) => void;
  getDailyContent: () => Promise<DailyPlan | null>;
  markSessionItemCompleted: (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') => void;
  markBookTrackSessionCompleted: (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') => void;
  isDailyPlanCompleted: () => boolean;
  isBookTrackCompletedToday: () => boolean;
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

export const useBookStore = create<BookStore>((set, get) => ({
  bookProgress: [],
  dailyPlan: null,
  bookTrackSessionCompletions: [],
  
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
    HybridStorageService.writeBookProgress(STORAGE_KEYS.BOOK_PROGRESS, updatedProgress);
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
    HybridStorageService.writeBookProgress(STORAGE_KEYS.BOOK_PROGRESS, updatedProgress);
  },
  
  getDailyContent: async () => {
    const state = get();
    
    // Check if we already have a plan for today
    if (state.dailyPlan && isToday(state.dailyPlan.timestamp)) {
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
      timestamp: Date.now(),
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
    HybridStorageService.writeDailyPlan(STORAGE_KEYS.DAILY_PLAN, dailyPlan);
    
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
    HybridStorageService.writeDailyPlan(STORAGE_KEYS.DAILY_PLAN, updatedPlan);
    
    // Mark completion with timestamp
    get().markBookTrackSessionCompleted(session, type);
  },
  
  markBookTrackSessionCompleted: (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') => {
    const newCompletion: BookTrackSessionCompletion = {
      session,
      type,
      timestamp: Date.now()
    };
    const newCompletions = [...get().bookTrackSessionCompletions, newCompletion];
    set({ bookTrackSessionCompletions: newCompletions });
    HybridStorageService.writeBookTrackSessions(STORAGE_KEYS.ROUTINES_BOOK_TRACK_SESSIONS, newCompletions);
  },
  
  isDailyPlanCompleted: () => {
    const state = get();
    const plan = state.dailyPlan;
    if (!plan) return false;
    
    const { session1, session2, session3 } = plan.sessions;
    const todayCompletions = state.bookTrackSessionCompletions.filter(c => isToday(c.timestamp));
    
    // Check if all required items in each session are completed today
    const isSessionItemCompleted = (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') => {
      return todayCompletions.some(c => c.session === session && c.type === type);
    };
    
    const session1Complete = 
      (session1.words.length === 0 || isSessionItemCompleted('session1', 'words')) &&
      (session1.sentences.length === 0 || isSessionItemCompleted('session1', 'sentences'));
    
    const session2Complete = 
      (session2.words.length === 0 || isSessionItemCompleted('session2', 'words')) &&
      (session2.sentences.length === 0 || isSessionItemCompleted('session2', 'sentences'));
    
    const session3Complete = 
      (session3.words.length === 0 || isSessionItemCompleted('session3', 'words')) &&
      (session3.sentences.length === 0 || isSessionItemCompleted('session3', 'sentences'));
    
    return session1Complete && session2Complete && session3Complete;
  },
  
  isBookTrackCompletedToday: () => {
    const state = get();
    const plan = state.dailyPlan;
    if (!plan) return false;
    
    // Check if the plan is for today
    if (!isToday(plan.timestamp)) return false;
    
    // Check if all sessions are completed
    return state.isDailyPlanCompleted();
  },
  
  hydrate: async () => {
    await HybridStorageService.initialize();
    const [storedProgress, storedPlan, storedBookTrackSessions] = await Promise.all([
      HybridStorageService.readBookProgress(STORAGE_KEYS.BOOK_PROGRESS),
      HybridStorageService.readDailyPlan(STORAGE_KEYS.DAILY_PLAN),
      HybridStorageService.readBookTrackSessions(STORAGE_KEYS.ROUTINES_BOOK_TRACK_SESSIONS)
    ]);
    
    const state: Partial<BookStore> = {};
    
    if (storedProgress) {
      state.bookProgress = storedProgress;
    } else {
      // Initialize if no stored progress
      get().initializeBookProgress();
    }
    
    if (storedPlan) {
      // Only use stored plan if it's for today
      if (isToday(storedPlan.timestamp)) {
        state.dailyPlan = storedPlan;
      }
      // If plan is from a previous day, don't load it - getDailyContent will generate a new one
    }
    
    if (storedBookTrackSessions) {
      state.bookTrackSessionCompletions = storedBookTrackSessions;
    }
    
    if (Object.keys(state).length > 0) {
      set(state);
    }
  },
  
  clearDailyPlan: () => {
    set({ dailyPlan: null });
    HybridStorageService.clear(STORAGE_KEYS.DAILY_PLAN);
  },
}));