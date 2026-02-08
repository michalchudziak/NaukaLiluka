import { Stack } from 'expo-router';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function MathLayout() {
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
        name="sets"
        options={{
          title: t('math.sets.title'),
          headerBackTitle: t('math.back'),
        }}
      />
      <Stack.Screen
        name="equations"
        options={{
          title: t('math.equations.title'),
          headerBackTitle: t('math.back'),
        }}
      />
    </Stack>
  );
}
