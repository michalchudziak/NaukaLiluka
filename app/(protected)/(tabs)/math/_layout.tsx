import { Stack } from 'expo-router';
import { ThemedTitle } from '@/components/ThemedTitle';
import { ForestCampTheme } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function MathLayout() {
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
      <Stack.Screen name="index" options={{ title: t('tabs.math') }} />
      <Stack.Screen name="sets" />
      <Stack.Screen name="equations" />
    </Stack>
  );
}
