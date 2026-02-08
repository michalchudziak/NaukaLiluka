import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { WordColors } from '@/constants/WordColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';

export default function BooksDailyScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const { getDailyData, markSessionItemCompleted, isSessionItemCompletedToday } = useBookStore();
  const dailyPlan = getDailyData();
  const [isLoading] = useState(false);

  const handleTrackPress = (
    sessionId: 'session1' | 'session2' | 'session3',
    type: 'words' | 'sentences'
  ) => {
    if (!dailyPlan) {
      return;
    }

    const sessionContent = dailyPlan.sessions[sessionId];
    const items = type === 'words' ? sessionContent.words : sessionContent.sentences;

    router.push({
      pathname: '/display',
      params: {
        items: JSON.stringify(items),
        type,
        color: selectedColor,
      },
    });

    markSessionItemCompleted(sessionId, type);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}` as 'session1' | 'session2' | 'session3';
    const sessionData = dailyPlan?.sessions[sessionKey];

    const hasWords = sessionData?.words && sessionData.words.length > 0;
    const hasSentences = sessionData?.sentences && sessionData.sentences.length > 0;
    const actions = [
      hasWords
        ? {
            id: 'words',
            title: t('booksDaily.words'),
            isCompleted: isSessionItemCompletedToday(sessionKey, 'words'),
            onPress: () => handleTrackPress(sessionKey, 'words'),
          }
        : null,
      hasSentences
        ? {
            id: 'sentences',
            title: t('booksDaily.sentences'),
            isCompleted: isSessionItemCompletedToday(sessionKey, 'sentences'),
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

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, { marginBottom: tabBarHeight }]}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>{t('booksDaily.loading')}</ThemedText>
      </ThemedView>
    );
  }

  if (!dailyPlan) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, { marginBottom: tabBarHeight }]}>
        <ThemedText style={styles.noContentText}>{t('booksDaily.noContent')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            marginBottom: tabBarHeight + 8,
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="subtitle" style={styles.bookTitle}>
          {dailyPlan.bookId}
        </ThemedText>

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
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    paddingTop: 14,
    paddingBottom: 30,
    gap: 14,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  sessionRow: {
    gap: 10,
    borderRadius: ForestCampTheme.radius.lg,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: 14,
    ...forestCampSoftShadow,
  },
  sessionLabel: {
    ...forestCampTypography.heading,
    fontSize: 20,
    lineHeight: 24,
    color: ForestCampTheme.colors.title,
  },
  actionsContainer: {
    gap: 10,
  },
  bookTitle: {
    ...forestCampTypography.display,
    fontSize: 34,
    lineHeight: 38,
    color: ForestCampTheme.colors.title,
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: ForestCampTheme.colors.textMuted,
  },
  noContentText: {
    ...forestCampTypography.heading,
    fontSize: 18,
    color: ForestCampTheme.colors.textMuted,
    textAlign: 'center',
  },
});
