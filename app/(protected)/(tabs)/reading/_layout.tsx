import { Stack } from 'expo-router';
import { ThemedTitle } from '@/components/ThemedTitle';
import { ForestCampTheme } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function ReadingLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: ForestCampTheme.colors.background },
        headerTitleAlign: 'center',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: ForestCampTheme.colors.primaryStrong,
        headerTitle: ({ children }) => <ThemedTitle>{children}</ThemedTitle>,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('tabs.reading') }} />
      <Stack.Screen name="no-rep-track" options={{ title: t('noRep.title') }} />
      <Stack.Screen name="book-track" options={{ title: t('bookTrack.title') }} />
      <Stack.Screen name="books-daily" />
      <Stack.Screen name="books-list" options={{ title: t('booksList.title') }} />
    </Stack>
  );
}
