import { AsyncStorageService } from '@/services/async-storage';
import { isToday } from 'date-fns';
import { create } from 'zustand';
import { useBookStore } from './book-store';


const STORAGE_KEYS = {
  ROUTINES_NO_REP_WORDS: 'routines.reading.no-rep.words',
  ROUTINES_NO_REP_SENTENCES: 'routines.reading.no-rep.sentences',
  ROUTINES_BOOK_TRACK_SESSIONS: 'routines.reading.book-track.sessions',
} as const;

interface BookTrackSessionCompletion {
  session: 'session1' | 'session2' | 'session3';
  type: 'words' | 'sentences';
  timestamp: number;
}

interface RoutinesStore {
  wordCompletionTimestamps: number[];
  sentenceCompletionTimestamps: number[];
  bookTrackSessionCompletions: BookTrackSessionCompletion[];
  
  markWordsCompleted: () => void;
  markSentencesCompleted: () => void;
  markBookTrackSessionCompleted: (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') => void;
  isWordsCompletedToday: () => boolean;
  isSentencesCompletedToday: () => boolean;
  isNoRepPathCompletedToday: () => boolean;
  isDailyPlanCompleted: () => boolean;
  isBookTrackCompletedToday: () => boolean;
  
  hydrate: () => Promise<void>;
}

export const useRoutinesStore = create<RoutinesStore>((set, get) => ({
  wordCompletionTimestamps: [],
  sentenceCompletionTimestamps: [],
  bookTrackSessionCompletions: [],
  
  markWordsCompleted: () => {
    const newTimestamps = [...get().wordCompletionTimestamps, Date.now()];
    set({ wordCompletionTimestamps: newTimestamps });
    AsyncStorageService.write(STORAGE_KEYS.ROUTINES_NO_REP_WORDS, newTimestamps);
  },
  
  markSentencesCompleted: () => {
    const newTimestamps = [...get().sentenceCompletionTimestamps, Date.now()];
    set({ sentenceCompletionTimestamps: newTimestamps });
    AsyncStorageService.write(STORAGE_KEYS.ROUTINES_NO_REP_SENTENCES, newTimestamps);
  },
  
  markBookTrackSessionCompleted: (session: 'session1' | 'session2' | 'session3', type: 'words' | 'sentences') => {
    const newCompletion: BookTrackSessionCompletion = {
      session,
      type,
      timestamp: Date.now()
    };
    const newCompletions = [...get().bookTrackSessionCompletions, newCompletion];
    set({ bookTrackSessionCompletions: newCompletions });
    AsyncStorageService.write(STORAGE_KEYS.ROUTINES_BOOK_TRACK_SESSIONS, newCompletions);
  },
  
  isWordsCompletedToday: () => {
    return get().wordCompletionTimestamps.some(timestamp => isToday(timestamp));
  },
  
  isSentencesCompletedToday: () => {
    return get().sentenceCompletionTimestamps.some(timestamp => isToday(timestamp));
  },
  
  isNoRepPathCompletedToday: () => {
    const wordsCompleted = get().isWordsCompletedToday();
    const sentencesCompleted = get().isSentencesCompletedToday();
    return wordsCompleted && sentencesCompleted;
  },
  
  isDailyPlanCompleted: () => {
    const bookStore = useBookStore.getState();
    const plan = bookStore.dailyPlan;
    if (!plan) return false;
    
    const { session1, session2, session3 } = plan.sessions;
    const todayCompletions = get().bookTrackSessionCompletions.filter(c => isToday(c.timestamp));
    
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
    const bookStore = useBookStore.getState();
    const plan = bookStore.dailyPlan;
    if (!plan) return false;
    
    // Check if the plan is for today
    if (!isToday(plan.timestamp)) return false;
    
    // Check if all sessions are completed
    return get().isDailyPlanCompleted();
  },
  
  hydrate: async () => {
    const [storedWordTimestamps, storedSentenceTimestamps, storedBookTrackSessions] = await Promise.all([
      AsyncStorageService.read(STORAGE_KEYS.ROUTINES_NO_REP_WORDS),
      AsyncStorageService.read(STORAGE_KEYS.ROUTINES_NO_REP_SENTENCES),
      AsyncStorageService.read(STORAGE_KEYS.ROUTINES_BOOK_TRACK_SESSIONS)
    ]);
    
    set({
      wordCompletionTimestamps: storedWordTimestamps || [],
      sentenceCompletionTimestamps: storedSentenceTimestamps || [],
      bookTrackSessionCompletions: storedBookTrackSessions || []
    });
  }
}));