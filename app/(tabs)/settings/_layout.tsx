import { Stack } from 'expo-router';
import { ForestCampTheme } from '@/constants/ForestCampTheme';

export default function SettingsLayout() {
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
      <Stack.Screen name="clear-storage" />
      <Stack.Screen name="view-storage" />
      <Stack.Screen name="reading-norep" />
      <Stack.Screen name="reading-interval" />
      <Stack.Screen name="reading-books" />
      <Stack.Screen name="drawings" />
      <Stack.Screen name="math" />
      <Stack.Screen name="cloud-data" />
    </Stack>
  );
}
