import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

export default function ReadingLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
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
