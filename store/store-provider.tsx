import { useEffect, useState } from 'react';
import { useBookStore } from './book-store';
import { useDrawingsStore } from './drawings-store';
import { useMathStore } from './math-store';
import { useNoRepStore } from './no-rep-store';
import { useSettingsStore } from './settings-store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    const hydrateStores = async () => {
      await Promise.all([
        useNoRepStore.getState().hydrate(),
        useBookStore.getState().hydrate(),
        useDrawingsStore.getState().hydrate(),
        useMathStore.getState().hydrate(),
        useSettingsStore.getState().hydrate()
      ]);
      setIsHydrated(true);
    };
    
    hydrateStores();
  }, []);
  
  if (!isHydrated) {
    return null;
  }
  
  return <>{children}</>;
}