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
import { useSettingsStore } from '@/store/settings-store';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export default function DisplayScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const settings = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(-1);
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

  useEffect(() => {
    settings.hydrate().then(() => {
      if (itemsWithSpacing.length === 0) return;

      intervalRef.current = setInterval(
        () => {
          fadeTransition(() => {
            setCurrentIndex((prevIndex) => prevIndex + 1);
          });
        },
        settings.reading.interval[params.type as 'words' | 'sentences']
      );
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    fadeTransition,
    itemsWithSpacing.length,
    params.type,
    settings.hydrate,
    settings.reading.interval[params.type as 'words' | 'sentences'],
  ]);

  useEffect(() => {
    if (currentIndex >= itemsWithSpacing.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      router.back();
    }
  }, [currentIndex, itemsWithSpacing.length, router.back]);

  if (itemsWithSpacing.length === 0) {
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
    paddingHorizontal: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
