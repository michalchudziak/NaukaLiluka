import { useConvexAuth } from 'convex/react';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { authClient } from '@/services/auth-client';
import { ConvexService } from '@/services/convex';

// TEST ONLY: signs in automatically on launch when no session is stored.
// Disable (or remove) before shipping a real build.
const TEST_AUTO_LOGIN = {
  enabled: true,
  email: 'mich.chudz@gmail.com',
  password: 'QQ11qq!!',
};

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
  const autoLoginAttempted = useRef(false);
  const sessionId = sessionData?.session?.id;

  useEffect(() => {
    if (isReady || isSessionPending || isAuthLoading) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      if (!sessionId && TEST_AUTO_LOGIN.enabled && !autoLoginAttempted.current) {
        autoLoginAttempted.current = true;

        const result = await authClient.signIn.email({
          email: TEST_AUTO_LOGIN.email,
          password: TEST_AUTO_LOGIN.password,
          fetchOptions: {
            throw: false,
          },
        });

        if (!result.error) {
          // useSession() picks up the new session and this effect re-runs.
          return;
        }

        console.warn('[Test auto-login] Sign-in failed:', result.error.message);

        if (isCancelled) {
          return;
        }
      }

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
