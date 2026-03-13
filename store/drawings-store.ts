import { isToday } from 'date-fns';
import { create } from 'zustand';
import { ConvexService, ignoreCloudFailure } from '@/services/convex';

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

  bootstrap: () => Promise<void>;
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
    void ConvexService.saveDrawingPresentation(newPresentations).catch(ignoreCloudFailure);
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

  bootstrap: async () => {
    const storedPresentations = await ConvexService.getDrawingPresentations();
    set({
      presentations: storedPresentations || [],
    });
  },
}));
