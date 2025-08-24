import { ColorPicker } from '@/components/ColorPicker';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import sentencesData from '@/content/sentences.json';
import wordsData from '@/content/words.json';
import { useTranslation } from '@/hooks/useTranslation';
import { DefaultSettings } from '@/services/default-settings';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function NoRepScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('#000000');

  const handleWordsPress = () => {
    const randomWords = getRandomItems(wordsData, DefaultSettings.reading.noRep.words);
    router.push({
      pathname: '/reading/display',
      params: {
        items: JSON.stringify(randomWords),
        color: selectedColor,
      },
    });
  };

  const handleSentencesPress = () => {
    const randomSentences = getRandomItems(sentencesData, DefaultSettings.reading.noRep.sentences);
    router.push({
      pathname: '/reading/display',
      params: {
        items: JSON.stringify(randomSentences),
        color: selectedColor,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ColorPicker
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        label={t('reading.selectColor')}
      />

      <ThemedView style={[styles.buttonsContainer, isHorizontal ? styles.horizontal : styles.vertical]}>
        <TrackButton 
          title={t('noRep.words')}
          isCompleted={false}
          onPress={handleWordsPress}
        />
        
        <TrackButton 
          title={t('noRep.sentences')}
          isCompleted={false}
          onPress={handleSentencesPress}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 30,
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