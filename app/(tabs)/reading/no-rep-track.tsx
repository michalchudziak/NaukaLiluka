import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ColorPicker } from '@/components/ColorPicker';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import sentencesData from '@/content/no-rep/sentences.json';
import wordsData from '@/content/no-rep/words.json';
import { useTranslation } from '@/hooks/useTranslation';
import { useNoRepStore } from '@/store/no-rep-store';

export default function NoRepScreen() {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const displayedWords = useNoRepStore((state) => state.displayedWords);
  const displayedSentences = useNoRepStore((state) => state.displayedSentences);
  const chooseAndMarkWords = useNoRepStore((state) => state.chooseAndMarkWords);
  const chooseAndMarkSentences = useNoRepStore((state) => state.chooseAndMarkSentences);
  const isWordsCompletedToday = useNoRepStore((state) => state.isWordsCompletedToday);
  const isSentencesCompletedToday = useNoRepStore((state) => state.isSentencesCompletedToday);
  const wordsCompletedToday = isWordsCompletedToday();
  const sentencesCompletedToday = isSentencesCompletedToday();
  const tabBarHeight = useBottomTabBarHeight();

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
  };

  const actions = [
    {
      id: 'words',
      title: t('noRep.words'),
      subtitle: wordsCompletedToday ? t('myDay.doneStatus') : t('myDay.pendingStatus'),
      isCompleted: wordsCompletedToday,
      onPress: handleWordsPress,
    },
    {
      id: 'sentences',
      title: t('noRep.sentences'),
      subtitle: sentencesCompletedToday ? t('myDay.doneStatus') : t('myDay.pendingStatus'),
      isCompleted: sentencesCompletedToday,
      onPress: handleSentencesPress,
    },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.content,
          {
            marginBottom: tabBarHeight + 16,
            paddingHorizontal: metrics.screenPadding,
          },
        ]}
      >
        <View style={[styles.textContainer, { maxWidth: metrics.maxContentWidth }]}>
          <ThemedText style={styles.counter}>
            {t('noRep.knownWordsCount', { count: displayedWords.length, total: wordsData.length })}
          </ThemedText>
          <ThemedText style={styles.counter}>
            {t('noRep.knownSentencesCount', {
              count: displayedSentences.length,
              total: sentencesData.length,
            })}
          </ThemedText>
        </View>

        <ThemedView
          style={[
            styles.actionsCard,
            {
              maxWidth: metrics.maxContentWidth,
            },
          ]}
        >
          {actions.map((action) => (
            <StateActionRow
              key={action.id}
              title={action.title}
              subtitle={action.subtitle}
              isCompleted={action.isCompleted}
              onPress={action.onPress}
            />
          ))}
        </ThemedView>

        <View style={[styles.pickerWrap, { maxWidth: metrics.maxContentWidth }]}>
          <ColorPicker
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            label={t('reading.selectColor')}
          />
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  content: {
    flex: 1,
    paddingTop: 14,
    width: '100%',
  },
  actionsCard: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: 16,
    gap: 10,
    alignSelf: 'center',
    ...forestCampSoftShadow,
  },
  counter: {
    ...forestCampTypography.body,
    fontSize: 15,
    color: ForestCampTheme.colors.textMuted,
  },
  textContainer: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.md,
    backgroundColor: ForestCampTheme.colors.cardMuted,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  pickerWrap: {
    width: '100%',
    marginTop: 14,
    marginBottom: 8,
  },
});
