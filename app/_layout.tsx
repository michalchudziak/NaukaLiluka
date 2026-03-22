import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import '@/i18n/i18n';
import { authClient } from '@/services/auth-client';
import { AppBootstrapProvider } from '@/providers/app-bootstrap-provider';
import { getConvexClient } from '@/services/convex';
import { hasCompletedOnboarding } from '@/services/onboarding-storage';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    hasCompletedOnboarding().then(setOnboardingDone);
  }, []);

  if (!loaded || onboardingDone === null) {
    return null;
  }

  return (
    <ConvexBetterAuthProvider client={getConvexClient()} authClient={authClient}>
      <ThemeProvider value={DefaultTheme}>
        <AppBootstrapProvider>
          <Stack>
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          {!onboardingDone && <Redirect href="/(onboarding)/welcome" />}
          <StatusBar style="dark" />
        </AppBootstrapProvider>
      </ThemeProvider>
    </ConvexBetterAuthProvider>
  );
}
