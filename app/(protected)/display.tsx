import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';
import { useAppSettings } from '@/hooks/useSettings';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export default function DisplayScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const settings = useAppSettings();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const currentIndexRef = useRef(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const parsedItems = useMemo(() => JSON.parse(params.items as string) as string[], [params.items]);
  const color = params.color as string;

  const itemsWithSpacing = useMemo(() => {
    const spacing = settings.reading.wordSpacing ?? 1;
    if (spacing === 1) return parsedItems;
    const spaces = ' '.repeat(spacing);
    return parsedItems.map((item) => item.split(' ').join(spaces));
  }, [parsedItems, settings.reading.wordSpacing]);

  const maxTextLength = useMemo(() => {
    return Math.max(...itemsWithSpacing.map((item) => item.length), 0);
  }, [itemsWithSpacing]);

  const fadeTransition = useCallback(
    (callback: () => void) => {
      'worklet';
      opacity.value = withTiming(0, { duration: 100 }, () => {
        runOnJS(callback)();
        opacity.value = withTiming(1, { duration: 100 });
      });
    },
    [opacity]
  );

  const displayInterval = (() => {
    const override = parseInt((params.interval as string) || '', 10);
    const fallback = settings.reading.interval[params.type as 'words' | 'sentences'];
    return Number.isFinite(override) && override > 0 ? override : fallback;
  })();

  useEffect(() => {
    if (itemsWithSpacing.length === 0) return;

    intervalRef.current = setInterval(() => {
      fadeTransition(() => {
        const next = currentIndexRef.current + 1;
        currentIndexRef.current = next;
        if (next >= itemsWithSpacing.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.back();
        } else {
          setCurrentIndex(next);
        }
      });
    }, displayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fadeTransition, itemsWithSpacing.length, displayInterval, router]);

  if (itemsWithSpacing.length === 0 || currentIndex === -1) {
    return <AnimatedThemedView style={[styles.container, animatedStyle]} />;
  }

  return (
    <AnimatedThemedView style={[styles.container, animatedStyle]}>
      {currentIndex >= 0 && currentIndex < itemsWithSpacing.length && (
        <AutoSizeText color={color} maxLength={maxTextLength}>
          {itemsWithSpacing[currentIndex]}
        </AutoSizeText>
      )}
    </AnimatedThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
