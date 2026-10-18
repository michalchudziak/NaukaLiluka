import { useConvexAuth, useQuery } from 'convex/react';
import { Redirect, Stack, useSegments } from 'expo-router';
import { api } from '@/convex/_generated/api';
import { isOnboardingProfileComplete } from '@/shared/dailyCommitment';

export default function ProtectedLayout() {
  const { isAuthenticated } = useConvexAuth();
  const settings = useQuery(api.settings.get, isAuthenticated ? {} : 'skip');
  const segments = useSegments() as string[];

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  if (settings === undefined) {
    return null;
  }

  const isProfileSetupRoute = segments.includes('profile-setup');
  const needsProfileSetup = !isOnboardingProfileComplete(settings.onboarding);

  if (needsProfileSetup && !isProfileSetupRoute) {
    return <Redirect href="/profile-setup" />;
  }

  if (!needsProfileSetup && isProfileSetupRoute) {
    return <Redirect href="/my-day" />;
  }

  return (
    <Stack>
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="display" options={{ headerShown: false }} />
      <Stack.Screen name="book-display" options={{ headerShown: false }} />
      <Stack.Screen name="drawing-display" options={{ headerShown: false }} />
      <Stack.Screen name="set-display" options={{ headerShown: false }} />
      <Stack.Screen name="equations-display" options={{ headerShown: false }} />
    </Stack>
  );
}
