import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export default function EquationsDisplayScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const pairs = useMemo(() => {
    try {
      return JSON.parse(params.pairs as string) as string[][];
    } catch {
      return [] as string[][];
    }
  }, [params.pairs]);

  const color = (params.color as string) || '#000';

  const [maxLeft, maxRight] = useMemo(() => {
    let l = 0;
    let r = 0;
    for (const p of pairs) {
      if (!p || p.length < 2) continue;
      l = Math.max(l, (p[0] || '').length);
      r = Math.max(r, (p[1] || '').length);
    }
    return [l, r];
  }, [pairs]);

  const fadeTransition = (callback: () => void) => {
    'worklet';
    opacity.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(callback)();
      opacity.value = withTiming(1, { duration: 100 });
    });
  };

  useEffect(() => {
    if (pairs.length === 0) return;
    intervalRef.current = setInterval(() => {
      fadeTransition(() => setCurrentIndex((i) => i + 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pairs.length]);

  useEffect(() => {
    if (currentIndex >= pairs.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      router.back();
    }
  }, [currentIndex, pairs.length, router]);

  if (pairs.length === 0) {
    return <AnimatedThemedView style={[styles.container, animatedStyle]} />;
  }

  const show = currentIndex >= 0 && currentIndex < pairs.length;
  const left = show ? pairs[currentIndex][0] : '';
  const right = show ? pairs[currentIndex][1] : '';

  return (
    <AnimatedThemedView style={[styles.container, animatedStyle]}>
      {show && (
        <View style={styles.row}>
          <View style={styles.side}>
            <AutoSizeText color={color} maxLength={maxLeft}>
              {left}
            </AutoSizeText>
          </View>
          <View style={styles.sideRight}>
            <AutoSizeText color={color} maxLength={maxRight}>
              {right}
            </AutoSizeText>
          </View>
        </View>
      )}
    </AnimatedThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '6%',
    justifyContent: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  side: {
    flex: 1,
    alignItems: 'flex-start',
  },
  sideRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
