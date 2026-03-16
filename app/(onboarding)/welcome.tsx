import { router } from 'expo-router';
import { useCallback } from 'react';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { markOnboardingCompleted } from '@/services/onboarding-storage';

export default function WelcomeScreen() {
  const handleComplete = useCallback(async () => {
    await markOnboardingCompleted();
    router.replace('/sign-in');
  }, []);

  return <OnboardingScreen onComplete={handleComplete} />;
}
