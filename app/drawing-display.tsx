import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import drawingSets from '@/content/drawings';
import { useDrawingsStore } from '@/store/drawings-store';
import { useSettingsStore } from '@/store/settings-store';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export default function DrawingDisplayScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const router = useRouter();
  const drawingsStore = useDrawingsStore();
  const settings = useSettingsStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [imageOrder, setImageOrder] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMarkedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const imageSet = drawingSets.find((set) => set.title === setId);

  useEffect(() => {
    if (imageSet && !hasMarkedRef.current) {
      hasMarkedRef.current = true;
      drawingsStore.markSetPresented(imageSet.title);
    }
  }, [imageSet, drawingsStore]);

  useEffect(() => {
    if (!imageSet) {
      return;
    }

    const indices = Array.from({ length: imageSet.images.length }, (_, i) => i);

    if (settings.drawings.randomOrder) {
      const shuffled = [...indices];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setImageOrder(shuffled);
    } else {
      setImageOrder(indices);
    }
  }, [imageSet, settings.drawings.randomOrder]);

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

  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!imageSet || isPaused) {
      clearCurrentInterval();
      return;
    }

    clearCurrentInterval();
    intervalRef.current = setInterval(() => {
      fadeTransition(() => {
        setCurrentImageIndex((prevIndex) => prevIndex + 1);
      });
    }, settings.drawings.interval);

    return () => {
      clearCurrentInterval();
    };
  }, [imageSet, settings.drawings.interval, fadeTransition, isPaused, clearCurrentInterval]);

  useEffect(() => {
    if (!imageSet || imageOrder.length === 0) {
      return;
    }

    if (currentImageIndex >= imageOrder.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      router.back();
    }
  }, [currentImageIndex, imageOrder, imageSet, router.back]);

  const currentImage =
    imageSet && currentImageIndex >= 0 && currentImageIndex < imageOrder.length
      ? imageSet.images[imageOrder[currentImageIndex]]
      : null;

  const factsToDisplay = useMemo(() => {
    if (!settings.drawings.showFacts || !currentImage?.facts || currentImage.facts.length === 0) {
      return [];
    }

    const pool = [...currentImage.facts];
    const desiredCount = Math.min(3, pool.length);
    const selected: string[] = [];

    while (selected.length < desiredCount && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      const [fact] = pool.splice(index, 1);
      selected.push(fact);
    }

    return selected;
  }, [currentImage, settings.drawings.showFacts]);

  if (!imageSet || imageOrder.length === 0 || currentImageIndex >= imageOrder.length) {
    return null;
  }

  const handlePressIn = () => {
    setIsPaused(true);
    clearCurrentInterval();
  };

  const handlePressOut = () => {
    setIsPaused(false);
  };

  if (currentImageIndex === -1) {
    return (
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.container}>
        <AnimatedThemedView style={[styles.content, animatedStyle]} />
      </Pressable>
    );
  }

  if (!currentImage) {
    return null;
  }

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.container}>
      <AnimatedThemedView style={[styles.content, animatedStyle]}>
        <View style={[styles.mainContent]}>
          <Image source={currentImage.image} style={styles.image} resizeMode="contain" />
          {settings.drawings.showCaptions && (
            <ThemedView style={styles.captionContainer}>
              <AutoSizeText color="#000000" style={styles.captionText}>
                {currentImage.description}
              </AutoSizeText>
            </ThemedView>
          )}
        </View>
        {settings.drawings.showFacts && factsToDisplay.length > 0 && (
          <ThemedView style={styles.factsSidebar}>
            {factsToDisplay.map((fact, index) => (
              <ThemedText key={`${currentImage.description}-${index}`} style={styles.factText}>
                • {fact}
              </ThemedText>
            ))}
          </ThemedView>
        )}
      </AnimatedThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainContent: {
    alignItems: 'center',
  },
  mainContentWithSidebar: {
    width: '80%',
  },
  image: {
    maxHeight: '70%',
    maxWidth: '90%',
  },
  captionContainer: {
    marginTop: 20,
    width: '100%',
    minHeight: 60,
  },
  captionText: {
    fontSize: 24,
    fontWeight: '600',
  },
  factsSidebar: {
    position: 'absolute',
    right: 20,
    top: 20,
    bottom: 20,
    maxWidth: '20%',
    width: '20%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factText: {
    color: '#C3C3C3',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
});
