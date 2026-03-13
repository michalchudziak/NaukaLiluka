import { useConvexAuth } from 'convex/react';
import { Redirect, Stack } from 'expo-router';
import { AuthStatusScreen } from '@/components/auth/auth-status-screen';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <AuthStatusScreen title={t('auth.loadingTitle')} description={t('auth.loadingDescription')} />
    );
  }

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
