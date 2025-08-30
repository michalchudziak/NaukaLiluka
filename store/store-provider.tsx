import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useBookStore } from './book-store';
import { useDrawingsStore } from './drawings-store';
import { useMathStore } from './math-store';
import { useNoRepStore } from './no-rep-store';
import { useSettingsStore } from './settings-store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const appState = useRef(AppState.currentState);

  const hydrateStores = async () => {
    await Promise.all([
      useNoRepStore.getState().hydrate(),
      useBookStore.getState().hydrate(),
      useDrawingsStore.getState().hydrate(),
      useMathStore.getState().hydrate(),
      useSettingsStore.getState().hydrate(),
    ]);
  };

  // Initial hydration on mount
  useEffect(() => {
    const initialHydrate = async () => {
      await hydrateStores();
      setIsHydrated(true);
    };

    initialHydrate();
  }, []);

  // Rehydrate when app comes from background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        hydrateStores();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
