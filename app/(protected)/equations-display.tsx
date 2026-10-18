import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';
import { useAppSettings } from '@/hooks/useSettings';
import { useTimedPresentation } from '@/hooks/useTimedPresentation';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

type EquationParams = { pairs: string; color: string; completion?: string };

export default function EquationsDisplayScreen() {
  const params = useLocalSearchParams<EquationParams>();
  return (
    <EquationsPresentation key={`${params.pairs}:${params.completion ?? ''}`} params={params} />
  );
}

function EquationsPresentation({ params }: { params: EquationParams }) {
  const { math } = useAppSettings();
  const equations = useMemo(() => {
    try {
      const pairs = JSON.parse(params.pairs as string) as string[][];
      return pairs.flatMap((pair: string[]) => pair);
    } catch {
      return [] as string[];
    }
  }, [params.pairs]);

  const color = (params.color as string) || '#000000';

  const { currentIndex, animatedStyle } = useTimedPresentation({
    itemCount: equations.length,
    interval: math.equations.interval,
    completion: params.completion,
  });

  if (equations.length === 0 || currentIndex === -1) {
    return <AnimatedThemedView style={[styles.container, animatedStyle]} />;
  }

  const currentEquation = equations[currentIndex];

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
    backgroundColor: '#ffffff',
    paddingHorizontal: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
