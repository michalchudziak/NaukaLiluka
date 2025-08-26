import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';
import drawingSets from '@/content/drawings';
import { useDrawingsStore } from '@/store/drawings-store';
import { useSettingsStore } from '@/store/settings-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export default function DrawingDisplayScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const router = useRouter();
  const drawingsStore = useDrawingsStore();
  const settings = useSettingsStore();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMarkedRef = useRef(false);
  
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  
  const imageSet = drawingSets.find(set => set.title === setId);

  useEffect(() => {
    if (imageSet && !hasMarkedRef.current) {
      hasMarkedRef.current = true;
      drawingsStore.markSetPresented(imageSet.title);
    }
  }, [imageSet, drawingsStore]);

  const fadeTransition = (callback: () => void) => {
    'worklet';
    opacity.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(callback)();
      opacity.value = withTiming(1, { duration: 100 });
    });
  };

  useEffect(() => {
    if (!imageSet) {
      return;
    }
    
    intervalRef.current = setInterval(() => {
      fadeTransition(() => {
        setCurrentImageIndex((prevIndex) => prevIndex + 1);
      });
    }, settings.drawings.interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [imageSet, settings.drawings.interval]);

  useEffect(() => {
    if (!imageSet) {
      return;
    }

    if (currentImageIndex >= imageSet.images.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      router.back();
    }
  }, [currentImageIndex]);
  
  if (!imageSet || currentImageIndex >= imageSet.images.length) {
    return null;
  }
  
  const handlePress = () => {
    router.back();
  };
  
  if (currentImageIndex === -1) {
    return (
      <Pressable onPress={handlePress} style={styles.container}>
        <AnimatedThemedView style={[styles.content, animatedStyle]} />
      </Pressable>
    );
  }
  
  const currentImage = imageSet.images[currentImageIndex];
  
  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <AnimatedThemedView style={[styles.content, animatedStyle]}>
        <Image
          source={currentImage.image}
          style={styles.image}
          resizeMode="contain"
        />
        {settings.drawings.showCaptions && (
          <ThemedView style={styles.captionContainer}>
            <AutoSizeText color="#000000" style={styles.captionText}>
              {currentImage.description}
            </AutoSizeText>
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
});