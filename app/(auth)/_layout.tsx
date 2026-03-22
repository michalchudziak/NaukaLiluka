import { useConvexAuth } from 'convex/react';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isAuthenticated } = useConvexAuth();

  if (isAuthenticated) {
    return <Redirect href="/my-day" />;
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
}
