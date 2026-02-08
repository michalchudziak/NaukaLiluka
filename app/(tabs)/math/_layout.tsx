import { Stack } from 'expo-router';
import { ForestCampTheme } from '@/constants/ForestCampTheme';

export default function MathLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTitle: '',
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerTintColor: ForestCampTheme.colors.primaryStrong,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sets" />
      <Stack.Screen name="equations" />
    </Stack>
  );
}
