import { ShapeType } from '@/components/ShapePicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  Circle,
  Diamond,
  Heart,
  Hexagon,
  Pentagon,
  Plus,
  Square,
  Star,
  Triangle,
  X
} from '@/components/shapes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

interface ShapePosition {
  x: number;
  y: number;
}

export default function SetDisplayScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { width, height } = useWindowDimensions();

  const numbers = useMemo(() => JSON.parse(params.numbers as string) as number[], [params.numbers]);
  
  // Calculate shape size based on screen dimensions to fit up to 200 dots
  const shapeSize = useMemo(() => {
    const maxShapes = Math.max(...numbers);
    const spacing = 15; // Minimum spacing between shapes
    const margin = 30;
    
    // Available area after accounting for safe areas and margins
    const availableWidth = width - insets.left - insets.right - (margin * 2);
    const availableHeight = height - insets.top - insets.bottom - (margin * 2);
    
    // Estimate grid dimensions for max shapes
    const gridSize = Math.ceil(Math.sqrt(maxShapes));
    
    // Calculate size based on available space
    const maxSizeByWidth = (availableWidth - (gridSize - 1) * spacing) / gridSize;
    const maxSizeByHeight = (availableHeight - (gridSize - 1) * spacing) / gridSize;
    
    // Use the smaller dimension and constrain between 8 and 25 pixels
    const calculatedSize = Math.min(maxSizeByWidth, maxSizeByHeight);
    return Math.max(8, Math.min(25, calculatedSize));
  }, [width, height, insets, numbers]);

  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  
  const shape = params.shape as ShapeType;
  const color = params.color as string;
  
  const currentNumber = currentIndex >= 0 && currentIndex < numbers.length ? numbers[currentIndex] : 0;
  
  const shapePositions = useMemo(() => {
    const positions: ShapePosition[] = [];
    const margin = 30;
    const topOffset = insets.top + shapeSize;
    const bottomOffset = insets.bottom + shapeSize;
    const leftOffset = insets.left + margin;
    const rightOffset = insets.right + margin;
    const minDistance = shapeSize + 15; // Minimum distance between shape centers
    
    for (let i = 0; i < currentNumber; i++) {
      let position: ShapePosition;
      let attempts = 0;
      const maxAttempts = 100;
      let foundValidPosition = false;
      
      do {
        position = {
          x: leftOffset + Math.random() * (width - shapeSize - leftOffset - rightOffset),
          y: topOffset + Math.random() * (height - shapeSize - topOffset - bottomOffset),
        };
        attempts++
        
        foundValidPosition = !positions.some(p => {
          const dx = p.x - position.x;
          const dy = p.y - position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < minDistance;
        });
      } while (!foundValidPosition && attempts < maxAttempts);
      
      positions.push(position);
    }
    
    return positions;
  }, [currentNumber, width, height, shapeSize, insets]);

  const renderShape = (shapeType: ShapeType) => {
    const shapeProps = { size: shapeSize, color };
    
    switch (shapeType) {
      case 'circle':
        return <Circle {...shapeProps} />;
      case 'square':
        return <Square {...shapeProps} />;
      case 'triangle':
        return <Triangle {...shapeProps} />;
      case 'x':
        return <X {...shapeProps} />;
      case 'star':
        return <Star {...shapeProps} />;
      case 'pentagon':
        return <Pentagon {...shapeProps} />;
      case 'hexagon':
        return <Hexagon {...shapeProps} />;
      case 'diamond':
        return <Diamond {...shapeProps} />;
      case 'heart':
        return <Heart {...shapeProps} />;
      case 'plus':
        return <Plus {...shapeProps} />;
    }
  };

  const fadeTransition = useCallback((callback: () => void) => {
    'worklet';
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(callback)();
      opacity.value = withTiming(1, { duration: 200 });
    });
  }, [opacity]);

  useEffect(() => {
    if (numbers.length === 0) return;

    intervalRef.current = setInterval(() => {
      fadeTransition(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [numbers.length, fadeTransition]);

  useEffect(() => {
    if (currentIndex >= numbers.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      router.back();
    }
  }, [currentIndex, numbers.length, router]);

  if (numbers.length === 0) {
    return <AnimatedThemedView style={[styles.container, animatedStyle]} />;
  }

  return (
    <AnimatedThemedView style={[styles.container, animatedStyle]}>
      <View style={[styles.counter, { top: insets.top + 10, left: insets.left + 20 }]}>
        <ThemedText style={styles.counterText}>{currentNumber}</ThemedText>
      </View>
      
      {currentIndex >= 0 && currentIndex < numbers.length && (
        <>
          {shapePositions.map((position, index) => (
            <View
              key={index}
              style={[
                styles.shape,
                {
                  left: position.x,
                  top: position.y,
                  width: shapeSize,
                  height: shapeSize,
                }
              ]}
            >
              {renderShape(shape)}
            </View>
          ))}
        </>
      )}
    </AnimatedThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  counter: {
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 20,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: {
    fontSize: 10,
    color: '#333',
  },
  shape: {
    position: 'absolute',
  },
});