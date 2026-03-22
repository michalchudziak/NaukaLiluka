import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  applyDrawingsPatch,
  applyMathEquationsPatch,
  applyMathNumbersPatch,
  applyReadingBooksPatch,
  applyReadingIntervalPatch,
  applyReadingNoRepPatch,
  applyReadingWordSpacingPatch,
  defaultSettings,
  type SettingsSnapshot,
} from '@/convex/settingsSnapshot';

interface SettingsLocalStore {
  getQuery(query: typeof api.settings.get, args: {}): SettingsSnapshot | undefined;
}

function getCurrentSettings(localStore: SettingsLocalStore) {
  return localStore.getQuery(api.settings.get, {}) ?? defaultSettings;
}

function fireAndForgetSettingsMutation(promise: Promise<unknown>) {
  void promise.catch((error) => {
    console.error('Failed to update settings:', error);
  });
}

export function useAppSettings(): SettingsSnapshot {
  return useQuery(api.settings.get, {}) ?? defaultSettings;
}

export function useSettingsActions() {
  const updateReadingNoRep = useMutation(api.settings.updateReadingNoRep).withOptimisticUpdate(
    (localStore, args) => {
      localStore.setQuery(
        api.settings.get,
        {},
        applyReadingNoRepPatch(getCurrentSettings(localStore), args)
      );
    }
  );
  const updateReadingInterval = useMutation(
    api.settings.updateReadingInterval
  ).withOptimisticUpdate((localStore, args) => {
    localStore.setQuery(
      api.settings.get,
      {},
      applyReadingIntervalPatch(getCurrentSettings(localStore), args)
    );
  });
  const updateReadingBooks = useMutation(api.settings.updateReadingBooks).withOptimisticUpdate(
    (localStore, args) => {
      localStore.setQuery(
        api.settings.get,
        {},
        applyReadingBooksPatch(getCurrentSettings(localStore), args)
      );
    }
  );
  const updateReadingWordSpacing = useMutation(
    api.settings.updateReadingWordSpacing
  ).withOptimisticUpdate((localStore, args) => {
    localStore.setQuery(
      api.settings.get,
      {},
      applyReadingWordSpacingPatch(getCurrentSettings(localStore), args.value)
    );
  });
  const updateDrawings = useMutation(api.settings.updateDrawings).withOptimisticUpdate(
    (localStore, args) => {
      localStore.setQuery(
        api.settings.get,
        {},
        applyDrawingsPatch(getCurrentSettings(localStore), args)
      );
    }
  );
  const updateMathEquations = useMutation(api.settings.updateMathEquations).withOptimisticUpdate(
    (localStore, args) => {
      localStore.setQuery(
        api.settings.get,
        {},
        applyMathEquationsPatch(getCurrentSettings(localStore), args)
      );
    }
  );
  const updateMathNumbers = useMutation(api.settings.updateMathNumbers).withOptimisticUpdate(
    (localStore, args) => {
      localStore.setQuery(
        api.settings.get,
        {},
        applyMathNumbersPatch(getCurrentSettings(localStore), args)
      );
    }
  );

  return {
    updateReadingNoRepWords: (value: number) =>
      fireAndForgetSettingsMutation(updateReadingNoRep({ words: value })),
    updateReadingNoRepSentences: (value: number) =>
      fireAndForgetSettingsMutation(updateReadingNoRep({ sentences: value })),
    updateReadingIntervalWords: (value: number) =>
      fireAndForgetSettingsMutation(updateReadingInterval({ words: value })),
    updateReadingIntervalSentences: (value: number) =>
      fireAndForgetSettingsMutation(updateReadingInterval({ sentences: value })),
    updateReadingBooksAllowAll: (value: boolean) =>
      fireAndForgetSettingsMutation(updateReadingBooks({ allowAllBooks: value })),
    updateReadingWordSpacing: (value: number) =>
      fireAndForgetSettingsMutation(updateReadingWordSpacing({ value })),
    updateDrawingsShowCaptions: (value: boolean) =>
      fireAndForgetSettingsMutation(updateDrawings({ showCaptions: value })),
    updateDrawingsShowFacts: (value: boolean) =>
      fireAndForgetSettingsMutation(updateDrawings({ showFacts: value })),
    updateDrawingsInterval: (value: number) =>
      fireAndForgetSettingsMutation(updateDrawings({ interval: value })),
    updateDrawingsRandomOrder: (value: boolean) =>
      fireAndForgetSettingsMutation(updateDrawings({ randomOrder: value })),
    updateMathEquationsInterval: (value: number) =>
      fireAndForgetSettingsMutation(updateMathEquations({ interval: value })),
    updateMathEquationsCount: (value: number) =>
      fireAndForgetSettingsMutation(updateMathEquations({ equationCount: value })),
    updateMathNumbersInterval: (value: number) =>
      fireAndForgetSettingsMutation(updateMathNumbers({ interval: value })),
    updateMathNumbersCount: (value: number) =>
      fireAndForgetSettingsMutation(updateMathNumbers({ numberCount: value })),
  };
}
