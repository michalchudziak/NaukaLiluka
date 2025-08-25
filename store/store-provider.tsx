import { useEffect, useState } from 'react';
import { useBookStore } from './book-store';
import { useNoRepStore } from './no-rep-store';
import { useRoutinesStore } from './routines-store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    const hydrateStores = async () => {
      await Promise.all([
        useNoRepStore.getState().hydrate(),
        useRoutinesStore.getState().hydrate(),
        useBookStore.getState().hydrate()
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