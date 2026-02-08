import { Stack } from 'expo-router';
import { ForestCampTheme } from '@/constants/ForestCampTheme';

export default function ReadingLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTitle: '',
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
        headerTintColor: ForestCampTheme.colors.primaryStrong,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="no-rep-track" />
      <Stack.Screen name="book-track" />
      <Stack.Screen name="books-daily" />
      <Stack.Screen name="books-list" />
    </Stack>
  );
}
