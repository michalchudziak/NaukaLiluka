import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AutoSizeText } from '@/components/AutoSizeText';
import type { ShapeType } from '@/components/ShapePicker';
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
  X,
} from '@/components/shapes';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { spacing } from '@/constants/ForestCampTheme';
import { useAppSettings } from '@/hooks/useSettings';
import { useTimedPresentation } from '@/hooks/useTimedPresentation';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

interface ShapePosition {
  x: number;
  y: number;
}

type SetParams = {
  numbers: string;
  shape: ShapeType;
  color: string;
  showNumberFollowups?: string;
  completion?: string;
};

export default function SetDisplayScreen() {
  const params = useLocalSearchParams<SetParams>();
  return <SetPresentation key={`${params.numbers}:${params.completion ?? ''}`} params={params} />;
}

function SetPresentation({ params }: { params: SetParams }) {
  const insets = useSafeAreaInsets();
  const { math } = useAppSettings();
  const { width, height } = useWindowDimensions();

  const showNumberFollowups = (params.showNumberFollowups as string) === 'true';

  const numbers = useMemo(() => {
    const arr = JSON.parse(params.numbers as string) as number[];
    return showNumberFollowups ? arr.flatMap((n) => [n, n]) : arr;
  }, [params.numbers, showNumberFollowups]);

  // Calculate shape size based on screen dimensions to fit up to 200 dots
  const shapeSize = useMemo(() => {
    const maxShapes = Math.max(...numbers);
    const spacing = 15; // Minimum spacing between shapes
    const margin = 30;

    // Available area after accounting for safe areas and margins
    const availableWidth = width - insets.left - insets.right - margin * 2;
    const availableHeight = height - insets.top - insets.bottom - margin * 2;

    // Estimate grid dimensions for max shapes
    const gridSize = Math.ceil(Math.sqrt(maxShapes));

    // Calculate size based on available space
    const maxSizeByWidth = (availableWidth - (gridSize - 1) * spacing) / gridSize;
    const maxSizeByHeight = (availableHeight - (gridSize - 1) * spacing) / gridSize;

    // Use the smaller dimension and constrain between 8 and 25 pixels
    const calculatedSize = Math.min(maxSizeByWidth, maxSizeByHeight);
    return Math.max(8, Math.min(25, calculatedSize));
  }, [width, height, insets, numbers]);

  const { currentIndex, animatedStyle } = useTimedPresentation({
    itemCount: numbers.length,
    interval: math.numbers.interval,
    completion: params.completion,
  });

  const shape = params.shape as ShapeType;
  const color = params.color as string;

  const currentNumber =
    currentIndex >= 0 && currentIndex < numbers.length ? numbers[currentIndex] : 0;

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
        attempts++;

        foundValidPosition = !positions.some((p) => {
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

  if (numbers.length === 0) {
    return <AnimatedThemedView style={[styles.container, animatedStyle]} />;
  }

  const renderContent = () => {
    return (
      <>
        <View style={[styles.counter, { top: insets.top + 10, left: insets.left + 20 }]}>
          <ThemedText style={styles.counterText}>{currentNumber}</ThemedText>
        </View>

        {currentIndex >= 0 &&
          currentIndex < numbers.length &&
          shapePositions.map((position, index) => (
            <View
              key={`${index}-${position.x}-${position.y}`}
              style={[
                styles.shape,
                {
                  left: position.x,
                  top: position.y,
                  width: shapeSize,
                  height: shapeSize,
                },
              ]}
            >
              {renderShape(shape)}
            </View>
          ))}
      </>
    );
  };

  if (currentIndex === -1) {
    return <AnimatedThemedView style={[styles.container, animatedStyle]} />;
  }

  return (
    <AnimatedThemedView style={[styles.container, animatedStyle]}>
      {showNumberFollowups ? (
        currentIndex % 2 === 0 ? (
          renderContent()
        ) : (
          <View style={styles.centerOverlay} pointerEvents="none">
            <AutoSizeText color={color}>{currentNumber.toString()}</AutoSizeText>
          </View>
        )
      ) : (
        renderContent()
      )}
    </AnimatedThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  counter: {
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 20,
    borderRadius: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  counterText: {
    fontSize: 10,
    color: '#333',
  },
  shape: {
    position: 'absolute',
  },
});
