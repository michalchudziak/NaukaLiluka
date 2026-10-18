import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { Alert, AppState } from 'react-native';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { usePresentationCompletion } from '@/hooks/usePresentationCompletion';
import { useTranslation } from '@/hooks/useTranslation';

export function useTimedPresentation({
  itemCount,
  interval,
  completion,
  items,
}: {
  itemCount: number;
  interval: number;
  completion?: string;
  items?: string[];
}) {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const [appState, setAppState] = useState(AppState.currentState);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [phase, setPhase] = useState<'playing' | 'saving' | 'completed' | 'error'>('playing');
  const complete = usePresentationCompletion(completion, items);
  const saveCompletion = useEffectEvent(complete);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Effect Events read the latest completion metadata without restarting the presentation timer.
  useEffect(() => {
    if (!isFocused || appState !== 'active') return;
    if (phase === 'completed' || itemCount === 0) {
      router.back();
      return;
    }
    if (phase !== 'playing') return;

    const timer = setTimeout(async () => {
      const next = currentIndex + 1;
      if (next < itemCount) {
        opacity.value = 0;
        setCurrentIndex(next);
        opacity.value = withTiming(1, { duration: 100 });
        return;
      }

      setPhase('saving');
      try {
        await saveCompletion();
        setPhase('completed');
      } catch (error) {
        console.error('Failed to complete presentation:', error);
        setPhase('error');
        Alert.alert(t('presentation.errorTitle'), t('presentation.saveError'), [
          { text: t('common.cancel'), style: 'cancel', onPress: () => router.back() },
          { text: t('common.retry'), onPress: () => setPhase('playing') },
        ]);
      }
    }, interval);

    return () => clearTimeout(timer);
  }, [appState, currentIndex, interval, isFocused, itemCount, opacity, phase, router, t]);

  useEffect(() => () => cancelAnimation(opacity), [opacity]);

  return { currentIndex, animatedStyle };
}
