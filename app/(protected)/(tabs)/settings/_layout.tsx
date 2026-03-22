import { Stack } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import {
  ForestCampTheme,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { isTablet } = getForestCampMetrics(width);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: ForestCampTheme.colors.background },
        headerTitleAlign: 'left',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: ForestCampTheme.colors.primaryStrong,
        headerTitleStyle: {
          ...forestCampTypography.display,
          fontSize: isTablet ? 36 : 30,
          color: ForestCampTheme.colors.title,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: t('tabs.settings') }} />
      <Stack.Screen name="reading-norep" options={{ title: t('settings.reading.noRepSettings') }} />
      <Stack.Screen
        name="reading-interval"
        options={{ title: t('settings.reading.intervalSettings') }}
      />
      <Stack.Screen name="reading-books" options={{ title: t('settings.reading.booksSettings') }} />
      <Stack.Screen name="account" options={{ title: t('settings.account.manage') }} />
      <Stack.Screen name="drawings" options={{ title: t('settings.drawings.settings') }} />
      <Stack.Screen name="math" options={{ title: t('settings.math.settings') }} />
      <Stack.Screen
        name="word-spacing"
        options={{ title: t('settings.reading.wordSpacingSettings') }}
      />
    </Stack>
  );
}
