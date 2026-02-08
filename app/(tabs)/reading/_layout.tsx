import { Stack } from 'expo-router';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function ReadingLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: ForestCampTheme.colors.card,
        },
        headerShadowVisible: false,
        headerTintColor: ForestCampTheme.colors.primaryStrong,
        headerTitleStyle: {
          ...forestCampTypography.heading,
          color: ForestCampTheme.colors.title,
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="no-rep-track"
        options={{
          title: t('noRep.title'),
          headerBackTitle: t('noRep.back'),
        }}
      />
      <Stack.Screen
        name="book-track"
        options={{
          title: t('bookTrack.title'),
          headerBackTitle: t('bookTrack.back'),
        }}
      />
      <Stack.Screen
        name="books-daily"
        options={{
          title: t('booksDaily.title'),
          headerBackTitle: t('booksDaily.back'),
        }}
      />
      <Stack.Screen
        name="books-list"
        options={{
          title: t('booksList.title'),
          headerBackTitle: t('booksList.back'),
        }}
      />
    </Stack>
  );
}
