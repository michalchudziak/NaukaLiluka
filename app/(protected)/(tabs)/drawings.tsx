import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import drawingsData from '@/content/drawings/index';
import { useDrawingsStatus } from '@/hooks/useDrawings';
import { useTranslation } from '@/hooks/useTranslation';

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function DrawingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const status = useDrawingsStatus();
  const todayTotal = status?.completedToday ? 1 : 0;
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);

  const progressPercent = todayTotal * 100;

  const handleSetPress = (setTitle: string) => {
    router.push({
      pathname: '/drawing-display',
      params: { setId: setTitle },
    });
  };

  const renderItem = ({ item }: { item: (typeof drawingsData)[0] }) => {
    const count = status?.completedSetTitle === item.title ? 1 : 0;

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
    <View style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: metrics.screenPadding }]}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <ThemedText type="subtitle" style={styles.totalCounter}>
              {t('drawings.totalToday', { count: todayTotal })}
            </ThemedText>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          <ThemedText style={styles.progressText}>
            {todayTotal > 0 ? t('myDay.doneStatus') : t('myDay.pendingStatus')}
          </ThemedText>
        </ThemedView>

        <FlatList
          style={styles.list}
          data={drawingsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          contentContainerStyle={[styles.listContent, { maxWidth: metrics.maxContentWidth }]}
          ItemSeparatorComponent={ListSeparator}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
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
  header: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: ForestCampTheme.radius.lg,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    gap: spacing.md,
    ...forestCampSoftShadow,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalCounter: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.title,
    fontSize: 19,
    lineHeight: 23,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  setCard: {
    backgroundColor: ForestCampTheme.colors.card,
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: spacing.lg,
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
    marginBottom: spacing.xs,
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
