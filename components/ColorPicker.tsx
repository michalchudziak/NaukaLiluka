import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WordColors } from '@/constants/WordColors';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  label?: string;
}

export function ColorPicker({ selectedColor, onColorSelect, label }: ColorPickerProps) {
  return (
    <ThemedView style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View style={styles.colorSwatches}>
        {WordColors.map((color) => (
          <TouchableOpacity
            key={color.name}
            onPress={() => onColorSelect(color.hex)}
            style={[
              styles.colorSwatch,
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
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  label: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: '600',
  },
  colorSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedSwatch: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
});