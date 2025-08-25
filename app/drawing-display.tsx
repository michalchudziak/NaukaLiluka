import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';
import drawingSets from '@/content/drawings';
import { DefaultSettings } from '@/services/default-settings';
import { useDrawingsStore } from '@/store/drawings-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet } from 'react-native';

export default function DrawingDisplayScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const router = useRouter();
  const drawingsStore = useDrawingsStore();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMarkedRef = useRef(false);
  
  const imageSet = drawingSets.find(set => set.title === setId);
  const { width } = Dimensions.get('window');
  const imageWidth = width * 0.9;
  
  // Handle invalid image set
  useEffect(() => {
    if (!imageSet) {
      const timer = setTimeout(() => {
        router.back();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [imageSet, router]);

  // Mark presentation once on mount
  useEffect(() => {
    if (imageSet && !hasMarkedRef.current) {
      hasMarkedRef.current = true;
      drawingsStore.markSetPresented(imageSet.title);
    }
  }, [imageSet, drawingsStore]);

  // Handle image rotation
  useEffect(() => {
    if (!imageSet) {
      return;
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= imageSet.images.length) {
          router.back();
          return prevIndex;
        }
        return nextIndex;
      });
    }, DefaultSettings.drawings.interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [imageSet, router]);
  
  if (!imageSet) {
    return null;
  }
  
  const handlePress = () => {
    router.back();
  };
  
  const getImageSource = (imageName: string) => {
    const imageMap: { [key: string]: any } = {
      'animals1/boar-track.png': require('@/content/drawings/animals1/boar-track.png'),
      'animals1/bull-track.png': require('@/content/drawings/animals1/bull-track.png'),
      'animals1/fox-track.png': require('@/content/drawings/animals1/fox-track.png'),
      'animals1/monkey-track.png': require('@/content/drawings/animals1/monkey-track.png'),
      'animals1/mouse-track.png': require('@/content/drawings/animals1/mouse-track.png'),
      'animals1/rhino-track.png': require('@/content/drawings/animals1/rhino-track.png'),
      'animals2/badger-track.png': require('@/content/drawings/animals2/badger-track.png'),
      'animals2/frog-track.png': require('@/content/drawings/animals2/frog-track.png'),
      'animals2/hare-track.png': require('@/content/drawings/animals2/hare-track.png'),
      'animals2/horse-track.png': require('@/content/drawings/animals2/horse-track.png'),
      'animals2/polecat-track.png': require('@/content/drawings/animals2/polecat-track.png'),
      'animals2/wolf-track.png': require('@/content/drawings/animals2/wolf-track.png'),
    };
    
    return imageMap[imageName];
  };
  
  if (currentImageIndex === -1) {
    return (
      <Pressable onPress={handlePress} style={styles.container}>
        <ThemedView style={styles.content} />
      </Pressable>
    );
  }
  
  const currentImage = imageSet.images[currentImageIndex];
  
  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <ThemedView style={styles.content}>
        <Image
          source={getImageSource(currentImage.image)}
          style={[styles.image, { width: imageWidth }]}
          resizeMode="contain"
        />
        {DefaultSettings.drawings.showCaptions && (
          <ThemedView style={styles.captionContainer}>
            <AutoSizeText color="#000000" style={styles.captionText}>
              {currentImage.description}
            </AutoSizeText>
          </ThemedView>
        )}
      </ThemedView>
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