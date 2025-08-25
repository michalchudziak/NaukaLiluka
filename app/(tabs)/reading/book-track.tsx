import { ColorPicker } from '@/components/ColorPicker';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

export default function BookTrackScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const tabBarHeight = useBottomTabBarHeight();

  const handleTrainingPress = () => {
    router.push('/reading/books-daily');
  };

  const handleBooksPress = () => {
    // TODO: Implement books functionality

  };

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight }]}>
      <ThemedView style={[styles.buttonsContainer, isHorizontal ? styles.horizontal : styles.vertical]}>
        <TrackButton 
          title={t('bookTrack.training')}
          isCompleted={false}
          onPress={handleTrainingPress}
        />
      
        <TrackButton 
          title={t('bookTrack.books')}
          isCompleted={false}
          onPress={handleBooksPress}
        />
      </ThemedView>

      <ColorPicker
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        label={t('reading.selectColor')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonsContainer: {
    flex: 1,
    gap: 20,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vertical: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
});