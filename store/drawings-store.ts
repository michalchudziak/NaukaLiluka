import { AsyncStorageService } from '@/services/async-storage';
import { isToday } from 'date-fns';
import { create } from 'zustand';

const STORAGE_KEYS = {
  DRAWINGS_PRESENTATIONS: 'progress.drawings.presentations',
} as const;

interface DrawingPresentation {
  setTitle: string;
  timestamp: number;
}

interface DrawingsStore {
  presentations: DrawingPresentation[];
  
  markSetPresented: (setTitle: string) => void;
  getTodayPresentations: () => DrawingPresentation[];
  getTodayPresentationCount: () => number;
  getTodaySetPresentationCount: (setTitle: string) => number;
  clearAll: () => void;
  
  hydrate: () => Promise<void>;
}

export const useDrawingsStore = create<DrawingsStore>((set, get) => ({
  presentations: [],
  
  markSetPresented: (setTitle: string) => {
    const newPresentation: DrawingPresentation = {
      setTitle,
      timestamp: Date.now()
    };
    const newPresentations = [...get().presentations, newPresentation];
    set({ presentations: newPresentations });
    AsyncStorageService.write(STORAGE_KEYS.DRAWINGS_PRESENTATIONS, newPresentations);
  },
  
  getTodayPresentations: () => {
    return get().presentations.filter(p => isToday(p.timestamp));
  },
  
  getTodayPresentationCount: () => {
    return get().getTodayPresentations().length;
  },
  
  getTodaySetPresentationCount: (setTitle: string) => {
    return get().getTodayPresentations().filter(p => p.setTitle === setTitle).length;
  },
  
  clearAll: () => {
    set({ presentations: [] });
    AsyncStorageService.clear(STORAGE_KEYS.DRAWINGS_PRESENTATIONS);
  },
  
  hydrate: async () => {
    const storedPresentations = await AsyncStorageService.read(STORAGE_KEYS.DRAWINGS_PRESENTATIONS);
    
    set({
      presentations: storedPresentations || []
    });
  }
}));