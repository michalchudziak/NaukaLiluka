import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import drawingsData from '@/content/drawings/index';
import { useTranslation } from '@/hooks/useTranslation';
import { useDrawingsStore } from '@/store/drawings-store';

const DAILY_GOALS = [4, 8, 12] as const;

export default function DrawingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const drawingsStore = useDrawingsStore();
  const todayTotal = drawingsStore.getTodayPresentationCount();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const [goalIndex, setGoalIndex] = useState(1);

  const dailyGoal = DAILY_GOALS[goalIndex];
  const progressPercent = Math.min(100, Math.round((todayTotal / dailyGoal) * 100));

  const handleSetPress = (setTitle: string) => {
    router.push({
      pathname: '/drawing-display',
      params: { setId: setTitle },
    });
  };

  const cycleGoal = () => {
    setGoalIndex((prev) => (prev + 1) % DAILY_GOALS.length);
  };

  const renderItem = ({ item }: { item: (typeof drawingsData)[0] }) => {
    const count = drawingsStore.getTodaySetPresentationCount(item.title);

    return (
      <Pressable
        style={({ pressed }) => [styles.setCard, pressed && styles.setCardPressed]}
        onPress={() => handleSetPress(item.title)}
      >
        <ThemedView style={styles.setCardContent}>
          <ThemedText type="defaultSemiBold" style={styles.setTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.setCount}>{t('drawings.presentedToday', { count })}</ThemedText>
        </ThemedView>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: metrics.screenPadding }]}>
        <ThemedText style={[styles.title, metrics.isTablet && styles.titleTablet]}>
          {t('tabs.pictures')}
        </ThemedText>

        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <ThemedText type="subtitle" style={styles.totalCounter}>
              {t('drawings.totalToday', { count: todayTotal })}
            </ThemedText>

            <Pressable style={styles.goalChip} onPress={cycleGoal}>
              <ThemedText style={styles.goalChipText}>{`Cel: ${dailyGoal}`}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          <ThemedText
            style={styles.progressText}
          >{`${progressPercent}% celu dziennego`}</ThemedText>
        </ThemedView>

        <FlatList
          style={styles.list}
          data={drawingsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          contentContainerStyle={[styles.listContent, { maxWidth: metrics.maxContentWidth }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'stretch',
    width: '100%',
  },
  list: {
    width: '100%',
  },
  title: {
    ...forestCampTypography.display,
    fontSize: 30,
    lineHeight: 34,
    color: ForestCampTheme.colors.title,
    marginTop: 12,
    marginBottom: 12,
  },
  titleTablet: {
    fontSize: 38,
    lineHeight: 42,
    marginTop: 14,
    marginBottom: 14,
  },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: ForestCampTheme.radius.lg,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    gap: 10,
    ...forestCampSoftShadow,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  totalCounter: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.title,
    fontSize: 19,
    lineHeight: 23,
    flex: 1,
  },
  goalChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.primaryStrong,
    backgroundColor: '#e8f4de',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  goalChipText: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.primaryStrong,
    fontSize: 12,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#dbe9cf',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: ForestCampTheme.colors.primary,
  },
  progressText: {
    ...forestCampTypography.body,
    color: ForestCampTheme.colors.textMuted,
    fontSize: 13,
  },
  listContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 14,
    paddingBottom: 20,
  },
  setCard: {
    backgroundColor: ForestCampTheme.colors.card,
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: 16,
    ...forestCampSoftShadow,
  },
  setCardPressed: {
    backgroundColor: ForestCampTheme.colors.cardMuted,
  },
  setCardContent: {
    backgroundColor: 'transparent',
  },
  setTitle: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.title,
    fontSize: 22,
    marginBottom: 4,
  },
  setCount: {
    ...forestCampTypography.body,
    color: ForestCampTheme.colors.textMuted,
    fontSize: 15,
  },
  separator: {
    height: 12,
    backgroundColor: 'transparent',
  },
});
