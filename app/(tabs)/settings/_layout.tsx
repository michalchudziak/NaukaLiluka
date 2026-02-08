import { Stack } from 'expo-router';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          title: t('settings.title'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="clear-storage"
        options={{
          title: t('settings.clearStorage.title'),
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="view-storage"
        options={{
          title: t('settings.viewStorage.title'),
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="reading-norep"
        options={{
          title: t('settings.reading.noRepSettings'),
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="reading-interval"
        options={{
          title: t('settings.reading.intervalSettings'),
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="reading-books"
        options={{
          title: t('settings.reading.booksSettings'),
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="drawings"
        options={{
          title: t('settings.drawings.settings'),
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="math"
        options={{
          title: t('settings.math.settings'),
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="cloud-data"
        options={{
          title: t('settings.cloudData.menuTitle'),
          headerShown: true,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
