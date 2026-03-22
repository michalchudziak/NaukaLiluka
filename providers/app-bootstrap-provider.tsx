import { useConvexAuth } from 'convex/react';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { authClient } from '@/services/auth-client';
import { ConvexService } from '@/services/convex';

type AppBootstrapProviderProps = {
  children: React.ReactNode;
};

async function hideSplashScreen() {
  try {
    await SplashScreen.hideAsync();
  } catch (error) {
    console.error('Failed to hide splash screen:', error);
  }
}

export function AppBootstrapProvider({ children }: AppBootstrapProviderProps) {
  const { data: sessionData, isPending: isSessionPending } = authClient.useSession();
  const { isLoading: isAuthLoading } = useConvexAuth();
  const [isReady, setIsReady] = useState(false);
  const sessionId = sessionData?.session?.id;

  useEffect(() => {
    if (isReady || isSessionPending || isAuthLoading) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      if (sessionId) {
        try {
          await ConvexService.ensureCurrentUser();
        } catch (error) {
          console.error('Failed to connect to Convex during app startup:', error);
        }
      }

      if (isCancelled) {
        return;
      }

      setIsReady(true);
      await hideSplashScreen();
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, isReady, isSessionPending, sessionId]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
