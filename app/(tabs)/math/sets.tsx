import { ColorPicker } from '@/components/ColorPicker';
import { ShapePicker, ShapeType } from '@/components/ShapePicker';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { WordColors } from '@/constants/WordColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

export default function SetsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const isHorizontal = width > height;
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');

  const handleOrderedPress = () => {
    const orderedNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    router.push({
      pathname: '/set-display',
      params: {
        numbers: JSON.stringify(orderedNumbers),
        shape: selectedShape,
        color: selectedColor,
      },
    });
  };

  const handleUnorderedPress = () => {
    const unorderedNumbers = [149, 148, 147, 146, 144, 140, 142, 141, 140, 148].sort(() => Math.random() - 0.5);
    router.push({
      pathname: '/set-display',
      params: {
        numbers: JSON.stringify(unorderedNumbers),
        shape: selectedShape,
        color: selectedColor,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={[styles.content, { paddingBottom: bottomTabBarHeight + 10 }]}>
        <ThemedView style={[styles.buttonsContainer, isHorizontal ? styles.horizontal : styles.vertical]}>
          <TrackButton 
            title={t('math.sets.ordered')}
            isCompleted={false}
            onPress={handleOrderedPress}
          />
          
          <TrackButton 
            title={t('math.sets.unordered')}
            isCompleted={false}
            onPress={handleUnorderedPress}
          />
        </ThemedView>
        
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
  buttonsContainer: {
    gap: 20,
    marginBottom: 20,
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  vertical: {
    flexDirection: 'column',
  },
});