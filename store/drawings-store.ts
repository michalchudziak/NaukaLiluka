import { isToday } from 'date-fns';
import { create } from 'zustand';
import { HybridStorageService } from '@/services/hybrid-storage';

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
      timestamp: Date.now(),
    };
    const newPresentations = [...get().presentations, newPresentation];
    set({ presentations: newPresentations });
    HybridStorageService.writeDrawingPresentations(
      STORAGE_KEYS.DRAWINGS_PRESENTATIONS,
      newPresentations
    );
  },

  getTodayPresentations: () => {
    return get().presentations.filter((p) => isToday(p.timestamp));
  },

  getTodayPresentationCount: () => {
    return get().getTodayPresentations().length;
  },

  getTodaySetPresentationCount: (setTitle: string) => {
    return get()
      .getTodayPresentations()
      .filter((p) => p.setTitle === setTitle).length;
  },

  clearAll: () => {
    set({ presentations: [] });
    HybridStorageService.clear(STORAGE_KEYS.DRAWINGS_PRESENTATIONS);
  },

  hydrate: async () => {
    await HybridStorageService.initialize();
    const storedPresentations = await HybridStorageService.readDrawingPresentations(
      STORAGE_KEYS.DRAWINGS_PRESENTATIONS
    );

    set({
      presentations: storedPresentations || [],
    });
  },
}));
