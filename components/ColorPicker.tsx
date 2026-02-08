import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { WordColors } from '@/constants/WordColors';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  label?: string;
}

export function ColorPicker({ selectedColor, onColorSelect, label }: ColorPickerProps) {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);

  return (
    <ThemedView style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View style={[styles.colorSwatches, metrics.isTablet && styles.colorSwatchesTablet]}>
        {WordColors.map((color) => (
          <TouchableOpacity
            key={color.name}
            onPress={() => onColorSelect(color.hex)}
            style={[
              styles.colorSwatch,
              metrics.isTablet && styles.colorSwatchTablet,
              { backgroundColor: color.hex },
              selectedColor === color.hex && styles.selectedSwatch,
            ]}
          />
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
  colorSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  colorSwatchesTablet: {
    gap: 14,
  },
  colorSwatch: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'rgba(31,58,41,0.2)',
    ...forestCampSoftShadow,
  },
  colorSwatchTablet: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  selectedSwatch: {
    borderColor: ForestCampTheme.colors.primaryStrong,
    borderWidth: 3,
  },
});
