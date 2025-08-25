import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';
import drawingSets from '@/content/drawings';
import { useDrawingsStore } from '@/store/drawings-store';
import { useSettingsStore } from '@/store/settings-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet } from 'react-native';

export default function DrawingDisplayScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const router = useRouter();
  const drawingsStore = useDrawingsStore();
  const settings = useSettingsStore();
  
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
    
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
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
        <ThemedView style={styles.content} />
      </Pressable>
    );
  }
  
  const currentImage = imageSet.images[currentImageIndex];
  
  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <ThemedView style={styles.content}>
        <Image
          source={currentImage.image}
          style={[styles.image, { width: imageWidth }]}
          resizeMode="contain"
        />
        {settings.drawings.showCaptions && (
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