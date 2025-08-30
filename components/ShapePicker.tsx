import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const renderShape = (shape: ShapeType) => {
    const shapeProps = { size: 30, color: '#333' };

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
      <View style={styles.shapeSwatches}>
        {shapes.map((shape) => (
          <TouchableOpacity
            key={shape}
            onPress={() => onShapeSelect(shape)}
            style={[styles.shapeSwatch, selectedShape === shape && styles.selectedSwatch]}
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
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  label: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: '600',
  },
  shapeSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  shapeSwatch: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedSwatch: {
    borderColor: '#007AFF',
    borderWidth: 3,
    backgroundColor: '#e8f4ff',
  },
});
