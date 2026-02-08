import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
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
} from './shapes';

export type ShapeType =
  | 'circle'
  | 'triangle'
  | 'square'
  | 'x'
  | 'star'
  | 'pentagon'
  | 'hexagon'
  | 'diamond'
  | 'heart'
  | 'plus';

interface ShapePickerProps {
  selectedShape: ShapeType;
  onShapeSelect: (shape: ShapeType) => void;
  label?: string;
}

const shapes: ShapeType[] = [
  'circle',
  'triangle',
  'square',
  'x',
  'star',
  'pentagon',
  'hexagon',
  'diamond',
  'heart',
  'plus',
];

export function ShapePicker({ selectedShape, onShapeSelect, label }: ShapePickerProps) {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);

  const renderShape = (shape: ShapeType) => {
    const shapeProps = {
      size: metrics.isTablet ? 34 : 28,
      color: ForestCampTheme.colors.primaryStrong,
    };

    switch (shape) {
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

  return (
    <ThemedView style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View style={[styles.shapeSwatches, metrics.isTablet && styles.shapeSwatchesTablet]}>
        {shapes.map((shape) => (
          <TouchableOpacity
            key={shape}
            onPress={() => onShapeSelect(shape)}
            style={[
              styles.shapeSwatch,
              metrics.isTablet && styles.shapeSwatchTablet,
              selectedShape === shape && styles.selectedSwatch,
            ]}
          >
            {renderShape(shape)}
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
    borderRadius: ForestCampTheme.radius.lg,
    backgroundColor: ForestCampTheme.colors.cardMuted,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: 16,
    ...forestCampSoftShadow,
  },
  label: {
    ...forestCampTypography.heading,
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 12,
    color: ForestCampTheme.colors.title,
  },
  shapeSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  shapeSwatchesTablet: {
    gap: 14,
  },
  shapeSwatch: {
    width: 54,
    height: 54,
    borderRadius: ForestCampTheme.radius.sm,
    borderWidth: 2,
    borderColor: 'rgba(47,134,83,0.2)',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...forestCampSoftShadow,
  },
  shapeSwatchTablet: {
    width: 62,
    height: 62,
  },
  selectedSwatch: {
    borderColor: ForestCampTheme.colors.primaryStrong,
    borderWidth: 3,
    backgroundColor: ForestCampTheme.colors.card,
  },
});
