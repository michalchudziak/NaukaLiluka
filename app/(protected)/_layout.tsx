import { useConvexAuth } from 'convex/react';
import { Redirect, Stack } from 'expo-router';

export default function ProtectedLayout() {
  const { isAuthenticated } = useConvexAuth();

  if (!isAuthenticated) {
    return <Redirect href="../sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="display" options={{ headerShown: false }} />
      <Stack.Screen name="book-display" options={{ headerShown: false }} />
      <Stack.Screen name="drawing-display" options={{ headerShown: false }} />
      <Stack.Screen name="set-display" options={{ headerShown: false }} />
      <Stack.Screen name="equations-display" options={{ headerShown: false }} />
    </Stack>
  );
}
