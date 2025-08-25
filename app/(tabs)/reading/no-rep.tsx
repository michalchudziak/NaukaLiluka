import { ColorPicker } from '@/components/ColorPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import sentencesData from '@/content/no-rep/sentences.json';
import wordsData from '@/content/no-rep/words.json';
import { chooseAndMarkSentences, chooseAndMarkWords } from '@/core/no-rep';
import { useTranslation } from '@/hooks/useTranslation';
import { StorageService } from '@/services/storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, useWindowDimensions } from 'react-native';

export default function NoRepScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [displayedSentences, setDisplayedSentences] = useState<string[]>([]);
  const [wordsCompletedToday, setWordsCompletedToday] = useState(false);
  const [sentencesCompletedToday, setSentencesCompletedToday] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const loadDisplayedItems = useCallback(async () => {
    const [words, sentences, wordsCompleted, sentencesCompleted] = await Promise.all([
      StorageService.getDisplayedWords(),
      StorageService.getDisplayedSentences(),
      StorageService.isWordsCompletedToday(),
      StorageService.isSentencesCompletedToday(),
    ]);
    setDisplayedWords(words);
    setDisplayedSentences(sentences);
    setWordsCompletedToday(wordsCompleted);
    setSentencesCompletedToday(sentencesCompleted);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDisplayedItems();
      return () => {};
    }, [loadDisplayedItems])
  );

  const handleWordsPress = async () => {
    const randomWords = await chooseAndMarkWords();

    if (randomWords.length === 0) {
      Alert.alert(t('noRep.noMoreWords'));
      return;
    }

    router.push({
      pathname: '/display',
      params: {
        items: JSON.stringify(randomWords),
        color: selectedColor,
        type: 'words',
      },
    });

    setDisplayedWords(randomWords);
    setWordsCompletedToday(true);
  };

  const handleSentencesPress = async () => {
    const randomSentences = await chooseAndMarkSentences();

    if (randomSentences.length === 0) {
      Alert.alert(t('noRep.noMoreSentences'));
      return;
    }

    router.push({
      pathname: '/display',
      params: {
        items: JSON.stringify(randomSentences),
        color: selectedColor,
        type: 'sentences',
      },
    });

    setDisplayedSentences(randomSentences);
    setSentencesCompletedToday(true);
  };

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight }]}>
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
          isCompleted={wordsCompletedToday}
          onPress={handleWordsPress}
        />
      
        <TrackButton 
          title={t('noRep.sentences')}
          isCompleted={sentencesCompletedToday}
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