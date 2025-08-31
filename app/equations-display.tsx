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

export default function EquationsDisplayScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { math } = useSettingsStore();

  const [currentIndex, setCurrentIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const equations = useMemo(() => {
    try {
      const pairs = JSON.parse(params.pairs as string) as string[][];
      return pairs.flatMap((pair: string[]) => pair);
    } catch {
      return [] as string[][];
    }
  }, [params.pairs]);

  const color = (params.color as string) || '#000000';

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
    if (equations.length === 0) return;

    intervalRef.current = setInterval(() => {
      fadeTransition(() => {
        setCurrentIndex((prev) => prev + 1);
      });
    }, math.equations.interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [equations.length, fadeTransition, math.equations.interval, hydrate]);

  useEffect(() => {
    if (currentIndex >= equations.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      router.back();
    }
  }, [currentIndex, equations.length, router]);

  if (equations.length === 0 || currentIndex === -1) {
    return <AnimatedThemedView style={[styles.container, animatedStyle]} />;
  }

  const currentEquation = equations[currentIndex];

  console.log(currentEquation);

  return (
    <AnimatedThemedView style={[styles.container, animatedStyle]}>
      {currentIndex >= 0 && currentIndex < equations.length && (
        <AutoSizeText
          maxLength={currentEquation.length}
          color={currentIndex % 2 === 0 ? '#000000' : color}
        >
          {currentEquation}
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
