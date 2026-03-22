import { useConvexAuth } from 'convex/react';
import { Redirect, Stack } from 'expo-router';
import { AuthStatusScreen } from '@/components/auth/auth-status-screen';
import { useTranslation } from '@/hooks/useTranslation';
import { ProtectedAppProvider } from '@/providers/protected-app-provider';

export default function ProtectedLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <AuthStatusScreen title={t('auth.loadingTitle')} description={t('auth.loadingDescription')} />
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="../sign-in" />;
  }

  return (
    <ProtectedAppProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="display" options={{ headerShown: false }} />
        <Stack.Screen name="book-display" options={{ headerShown: false }} />
        <Stack.Screen name="drawing-display" options={{ headerShown: false }} />
        <Stack.Screen name="set-display" options={{ headerShown: false }} />
        <Stack.Screen name="equations-display" options={{ headerShown: false }} />
      </Stack>
    </ProtectedAppProvider>
  );
}
