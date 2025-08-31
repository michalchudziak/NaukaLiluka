import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

export default function MathLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
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
