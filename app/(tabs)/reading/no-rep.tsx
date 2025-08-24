import { ColorPicker } from '@/components/ColorPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import sentencesData from '@/content/sentences.json';
import wordsData from '@/content/words.json';
import { useTranslation } from '@/hooks/useTranslation';
import { DefaultSettings } from '@/services/default-settings';
import { StorageService } from '@/services/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

function getRandomItems<T>(array: T[], count: number, exclude: T[] = []): T[] {
  const available = array.filter(item => !exclude.includes(item));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function NoRepScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [displayedSentences, setDisplayedSentences] = useState<string[]>([]);

  const loadDisplayedItems = useCallback(async () => {
    const [words, sentences] = await Promise.all([
      StorageService.getDisplayedWords(),
      StorageService.getDisplayedSentences(),
    ]);
    setDisplayedWords(words);
    setDisplayedSentences(sentences);
  }, []);

  useEffect(() => {
    loadDisplayedItems();
  }, [loadDisplayedItems]);

  useFocusEffect(
    useCallback(() => {
      loadDisplayedItems();
      return () => {};
    }, [loadDisplayedItems])
  );

  const handleWordsPress = async () => {
    const randomWords = getRandomItems(wordsData, DefaultSettings.reading.noRep.words, displayedWords);
    
    if (randomWords.length === 0) {
      await StorageService.clearDisplayedWords();
      setDisplayedWords([]);
      const freshWords = getRandomItems(wordsData, DefaultSettings.reading.noRep.words);
      await StorageService.addDisplayedWords(freshWords);
      setDisplayedWords(freshWords);
      
      router.push({
        pathname: '/reading/display',
        params: {
          items: JSON.stringify(freshWords),
          color: selectedColor,
          type: 'words',
        },
      });
    } else {
      await StorageService.addDisplayedWords(randomWords);
      setDisplayedWords([...displayedWords, ...randomWords]);
      
      router.push({
        pathname: '/reading/display',
        params: {
          items: JSON.stringify(randomWords),
          color: selectedColor,
          type: 'words',
        },
      });
    }
  };

  const handleSentencesPress = async () => {
    const randomSentences = getRandomItems(sentencesData, DefaultSettings.reading.noRep.sentences, displayedSentences);
    
    if (randomSentences.length === 0) {
      await StorageService.clearDisplayedSentences();
      setDisplayedSentences([]);
      const freshSentences = getRandomItems(sentencesData, DefaultSettings.reading.noRep.sentences);
      await StorageService.addDisplayedSentences(freshSentences);
      setDisplayedSentences(freshSentences);
      
      router.push({
        pathname: '/reading/display',
        params: {
          items: JSON.stringify(freshSentences),
          color: selectedColor,
          type: 'sentences',
        },
      });
    } else {
      await StorageService.addDisplayedSentences(randomSentences);
      setDisplayedSentences([...displayedSentences, ...randomSentences]);
      
      router.push({
        pathname: '/reading/display',
        params: {
          items: JSON.stringify(randomSentences),
          color: selectedColor,
          type: 'sentences',
        },
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.textContainer}>
        <ThemedText style={styles.counter}>
          {t('noRep.knownWordsCount', { count: displayedWords.length, total: wordsData.length })}
        </ThemedText>
        <ThemedText style={styles.counter}>
          {t('noRep.knownSentencesCount', { count: displayedSentences.length, total: sentencesData.length })}
        </ThemedText>
      </ThemedView>


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
  buttonWrapper: {
    alignItems: 'center',
    gap: 10,
  },
  counter: {
    fontSize: 14,
    opacity: 0.7,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});