import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ColorPicker } from '@/components/ColorPicker';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useChooseAndMark, useNoRepStatus } from '@/hooks/useNoRep';
import { useTranslation } from '@/hooks/useTranslation';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const guideImage = require('@/assets/images/guides/no-rep.png');

export default function NoRepScreen() {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const status = useNoRepStatus();
  const chooseAndMark = useChooseAndMark();
  const tabBarHeight = useBottomTabBarHeight();

  const wordsCompletedToday = status?.isWordsCompletedToday ?? false;
  const sentencesCompletedToday = status?.isSentencesCompletedToday ?? false;

  const imageSize = Math.min(width * 0.35, 160);

  const handleWordsPress = async () => {
    const selected = await chooseAndMark({ contentType: 'words' });

    if (selected.length === 0) {
      Alert.alert(t('noRep.noMoreWords'));
      return;
    }

    router.push({
      pathname: '/display',
      params: {
        items: JSON.stringify(selected),
        color: selectedColor,
        type: 'words',
      },
    });
  };

  const handleSentencesPress = async () => {
    const selected = await chooseAndMark({ contentType: 'sentences' });

    if (selected.length === 0) {
      Alert.alert(t('noRep.noMoreSentences'));
      return;
    }

    router.push({
      pathname: '/display',
      params: {
        items: JSON.stringify(selected),
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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: spacing.md,
            paddingBottom: tabBarHeight + spacing.lg,
            paddingHorizontal: metrics.screenPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.guideCard, { maxWidth: metrics.maxContentWidth }]}>
          <View style={styles.guideRow}>
            <Image
              source={guideImage}
              style={[styles.guideImage, { width: imageSize, height: imageSize }]}
              resizeMode="cover"
            />
            <View style={styles.guideTextWrap}>
              <ThemedText style={styles.guideTitle}>{t('noRep.guideTitle')}</ThemedText>
              <ThemedText style={styles.guideBody}>{t('noRep.guideBody')}</ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.textContainer, { maxWidth: metrics.maxContentWidth }]}>
          <ThemedText style={styles.counter}>
            {t('noRep.knownWordsCount', {
              count: status?.displayedWordsCount ?? 0,
              total: status?.totalWordsCount ?? 0,
            })}
          </ThemedText>
          <ThemedText style={styles.counter}>
            {t('noRep.knownSentencesCount', {
              count: status?.displayedSentencesCount ?? 0,
              total: status?.totalSentencesCount ?? 0,
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
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    gap: spacing.lg,
  },
  guideCard: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.lg,
    alignSelf: 'center',
    ...forestCampSoftShadow,
  },
  guideRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  guideImage: {
    borderRadius: ForestCampTheme.radius.md,
  },
  guideTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  guideTitle: {
    ...forestCampTypography.heading,
    fontSize: 17,
    lineHeight: 22,
    color: ForestCampTheme.colors.title,
  },
  guideBody: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.textMuted,
  },
  actionsCard: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.lg,
    gap: spacing.md,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pickerWrap: {
    width: '100%',
  },
});
