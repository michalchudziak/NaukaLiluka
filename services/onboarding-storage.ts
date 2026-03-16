import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'naukaliluka-onboarding-completed';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return value === 'true';
}

export async function markOnboardingCompleted(): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
}
