import { Stack } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import {
  ForestCampTheme,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function MathLayout() {
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
      <Stack.Screen name="index" options={{ title: t('tabs.math') }} />
      <Stack.Screen name="sets" />
      <Stack.Screen name="equations" />
    </Stack>
  );
}
