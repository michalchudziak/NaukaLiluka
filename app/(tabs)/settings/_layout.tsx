import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: t('settings.title'),
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="clear-storage" 
        options={{ 
          title: t('settings.clearStorage.title'),
          headerShown: true,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="view-storage" 
        options={{ 
          title: t('settings.viewStorage.title'),
          headerShown: true
        }} 
      />
    </Stack>
  );
}