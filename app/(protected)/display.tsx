import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';
import { useAppSettings } from '@/hooks/useSettings';
import { useTimedPresentation } from '@/hooks/useTimedPresentation';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

type DisplayParams = {
  items: string;
  color: string;
  type: 'words' | 'sentences';
  interval?: string;
  completion?: string;
};

export default function DisplayScreen() {
  const params = useLocalSearchParams<DisplayParams>();
  return <DisplayPresentation key={`${params.items}:${params.completion ?? ''}`} params={params} />;
}

function DisplayPresentation({ params }: { params: DisplayParams }) {
  const settings = useAppSettings();
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

  const displayInterval = (() => {
    const override = parseInt((params.interval as string) || '', 10);
    const fallback = settings.reading.interval[params.type as 'words' | 'sentences'];
    return Number.isFinite(override) && override > 0 ? override : fallback;
  })();

  const { currentIndex, animatedStyle } = useTimedPresentation({
    itemCount: itemsWithSpacing.length,
    interval: displayInterval,
    completion: params.completion,
    items: parsedItems,
  });

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
