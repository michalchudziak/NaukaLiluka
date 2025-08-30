import { ColorPicker } from '@/components/ColorPicker';
import { ShapePicker, ShapeType } from '@/components/ShapePicker';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { WordColors } from '@/constants/WordColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function SetsScreen() {
  const { t } = useTranslation();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');

  const handleStartTrack = () => {
    console.log('Starting track with:', { color: selectedColor, shape: selectedShape });
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <TrackButton 
          title={t('math.sets.startTrack')}
          isCompleted={false}
          onPress={handleStartTrack}
        />
        
        <ColorPicker
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          label={t('math.sets.selectColor')}
        />

        <ShapePicker
          selectedShape={selectedShape}
          onShapeSelect={setSelectedShape}
          label={t('math.sets.selectShape')}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: '100%',
    padding: 20,
    paddingTop: 40,
  },
});