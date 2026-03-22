import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ColorPicker } from '@/components/ColorPicker';
import { GuideCard } from '@/components/GuideCard';
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
import { WordColors } from '@/constants/WordColors';
import { useBookDailyContent, useCompleteBookSession } from '@/hooks/useBooks';
import { useTranslation } from '@/hooks/useTranslation';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const guideImage = require('@/assets/images/guides/book.png');

export default function BooksDailyScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const dailyPlan = useBookDailyContent();
  const completeSession = useCompleteBookSession();

  const handleTrackPress = (
    sessionId: 'session1' | 'session2' | 'session3',
    type: 'words' | 'sentences'
  ) => {
    if (!dailyPlan) {
      return;
    }

    const sessionContent = dailyPlan.content[sessionId];
    const items = type === 'words' ? sessionContent.words : sessionContent.sentences;

    router.push({
      pathname: '/display',
      params: {
        items: JSON.stringify(items),
        type,
        color: selectedColor,
      },
    });

    void completeSession(sessionId, type);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}` as 'session1' | 'session2' | 'session3';
    const sessionStatus = dailyPlan?.sessions[sessionKey];

    const actions = [
      sessionStatus?.hasWords
        ? {
            id: 'words',
            title: t('booksDaily.words'),
            isCompleted: sessionStatus.isWordsCompleted,
            onPress: () => handleTrackPress(sessionKey, 'words'),
          }
        : null,
      sessionStatus?.hasSentences
        ? {
            id: 'sentences',
            title: t('booksDaily.sentences'),
            isCompleted: sessionStatus.isSentencesCompleted,
            onPress: () => handleTrackPress(sessionKey, 'sentences'),
          }
        : null,
    ].filter(Boolean) as Array<{
      id: string;
      title: string;
      isCompleted: boolean;
      onPress: () => void;
    }>;

    return (
      <View key={sessionKey} style={styles.sessionRow}>
        <ThemedText type="subtitle" style={styles.sessionLabel}>
          {t(`booksDaily.${sessionKey}`)}
        </ThemedText>
        <View style={styles.actionsContainer}>
          {actions.map((action) => (
            <StateActionRow
              key={action.id}
              title={action.title}
              subtitle={action.isCompleted ? t('myDay.doneStatus') : t('myDay.pendingStatus')}
              isCompleted={action.isCompleted}
              onPress={action.onPress}
            />
          ))}
        </View>
      </View>
    );
  };

  if (!dailyPlan) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, { marginBottom: tabBarHeight }]}>
        <ThemedText style={styles.noContentText}>{t('booksDaily.noContent')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: dailyPlan.activeBookTitle }} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + spacing.lg,
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GuideCard
          image={guideImage}
          title={t('booksDaily.guideTitle')}
          body={t('booksDaily.guideBody')}
        />

        <View style={styles.sessionsContainer}>
          {renderSession(1)}
          {renderSession(2)}
          {renderSession(3)}
        </View>

        <ColorPicker
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          label={t('booksDaily.selectColor')}
        />
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
    alignSelf: 'center',
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionsContainer: {
    gap: spacing.xl,
  },
  sessionRow: {
    gap: spacing.md,
    borderRadius: ForestCampTheme.radius.lg,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: spacing.lg,
    ...forestCampSoftShadow,
  },
  sessionLabel: {
    ...forestCampTypography.heading,
    fontSize: 20,
    lineHeight: 24,
    color: ForestCampTheme.colors.title,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  noContentText: {
    ...forestCampTypography.heading,
    fontSize: 18,
    color: ForestCampTheme.colors.textMuted,
    textAlign: 'center',
  },
});
