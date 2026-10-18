import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

export function usePresentationLaunch() {
  const locked = useRef(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      locked.current = false;
      setIsLaunching(false);
    }, [])
  );

  const launch = async (open: () => boolean | Promise<boolean>) => {
    if (locked.current) return;
    locked.current = true;
    setIsLaunching(true);
    try {
      if (await open()) return;
    } catch (error) {
      console.error('Failed to start presentation:', error);
      Alert.alert(t('presentation.errorTitle'), t('presentation.startError'));
    }
    locked.current = false;
    setIsLaunching(false);
  };

  return { launch, isLaunching };
}
