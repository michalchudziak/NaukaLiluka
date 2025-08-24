import { useTranslation } from '@/hooks/useTranslation';
import { Stack } from 'expo-router';

export default function ReadingLayout() {
  const { t } = useTranslation();
  
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="no-rep" 
        options={{ 
          title: t('noRep.title'),
          headerBackTitle: t('noRep.back')
        }} 
      />
      <Stack.Screen 
        name="display" 
        options={{ 
          title: t('noRep.title'),
          headerBackTitle: t('noRep.back')
        }} 
      />
    </Stack>
  );
}