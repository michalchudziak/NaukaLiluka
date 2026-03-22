import { Stack } from 'expo-router';
<<<<<<< ours
import { ThemedTitle } from '@/components/ThemedTitle';
import { ForestCampTheme } from '@/constants/ForestCampTheme';
=======
import { useWindowDimensions } from 'react-native';
import {
  ForestCampTheme,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
>>>>>>> theirs
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsLayout() {
  const { t } = useTranslation();
<<<<<<< ours
=======
  const { width } = useWindowDimensions();
  const { isTablet } = getForestCampMetrics(width);
>>>>>>> theirs

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: ForestCampTheme.colors.background },
<<<<<<< ours
        headerTitleAlign: 'center',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: ForestCampTheme.colors.primaryStrong,
        headerTitle: ({ children }) => <ThemedTitle>{children}</ThemedTitle>,
=======
        headerTitleAlign: 'left',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: ForestCampTheme.colors.primaryStrong,
        headerTitleStyle: {
          ...forestCampTypography.display,
          fontSize: isTablet ? 36 : 30,
          color: ForestCampTheme.colors.title,
        },
>>>>>>> theirs
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
