import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useBookStatus } from '@/hooks/useBooks';
import { useDrawingsStatus } from '@/hooks/useDrawings';
import { useNoRepStatus } from '@/hooks/useNoRep';
import { useTranslation } from '@/hooks/useTranslation';
import { useEquationsStore } from '@/store/equations-store';
import { useMathStore } from '@/store/math-store';

type RoutineItem = {
  id: string;
  title: string;
  isCompleted: boolean;
  onPress: () => void;
};

function RoutineSection({
  title,
  routines,
  badgeVariant,
  showCompleted,
}: {
  title: string;
  routines: RoutineItem[];
  badgeVariant: 'reading' | 'drawings' | 'math';
  showCompleted: boolean;
}) {
  const { t } = useTranslation();
  const items = showCompleted ? routines : routines.filter((r) => !r.isCompleted);

  if (items.length === 0) return null;

  const done = routines.filter((r) => r.isCompleted).length;
  const percent = Math.round((done / routines.length) * 100);

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <View
          style={[
            styles.sectionPercentBadge,
            badgeVariant === 'reading' && styles.sectionPercentReading,
            badgeVariant === 'drawings' && styles.sectionPercentDrawings,
            badgeVariant === 'math' && styles.sectionPercentMath,
          ]}
        >
          <ThemedText style={styles.sectionPercentText}>{percent}%</ThemedText>
        </View>
      </View>

      <View style={styles.sectionRows}>
        {items.map((routine) => (
          <StateActionRow
            key={routine.id}
            title={routine.title}
            subtitle={routine.isCompleted ? t('myDay.doneStatus') : t('myDay.pendingStatus')}
            isCompleted={routine.isCompleted}
            onPress={routine.onPress}
          />
        ))}
      </View>
    </View>
  );
}

export default function MyDayScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const noRepStatus = useNoRepStatus();
  const bookStatus = useBookStatus();
  const drawingsStatus = useDrawingsStatus();
  const { isSessionCompletedToday: isMathSessionCompletedToday, currentDay } = useMathStore();
  const { isSessionCompletedToday: isEqSessionCompletedToday } = useEquationsStore();

  const [showCompleted, setShowCompleted] = useState(true);

  const todayLabel = useMemo(() => {
    const formatted = format(new Date(), 'EEEE, d MMMM', { locale: pl });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, []);

  // Derived completion state - computed during render, no polling needed.
  // Zustand subscriptions trigger re-renders when store data changes.
  const isNoRepCompleted =
    (noRepStatus?.isWordsCompletedToday && noRepStatus?.isSentencesCompletedToday) ?? false;

  const s1 = bookStatus?.sessions.session1;
  const s2 = bookStatus?.sessions.session2;
  const s3 = bookStatus?.sessions.session3;

  const isSession1Completed = s1?.isWordsCompleted ?? false;
  const isSession2Completed = s2?.isWordsCompleted ?? false;
  const isSession3Completed =
    (s3?.isWordsCompleted && (!s3?.hasSentences || s3?.isSentencesCompleted)) ?? false;

  const isDrawingsCompleted = drawingsStatus?.completedToday ?? false;

  const isMathSession1Completed = currentDay <= 30 && isMathSessionCompletedToday('session1');
  const isMathSession2Completed = currentDay <= 30 && isMathSessionCompletedToday('session2');
  const isEqSession1Completed = currentDay > 30 && isEqSessionCompletedToday('session1');
  const isEqSession2Completed = currentDay > 30 && isEqSessionCompletedToday('session2');

  type TabName = 'my-day' | 'reading' | 'math' | 'drawings' | 'settings';

  const resetToTab = (
    tab: TabName,
    nestedState?: { routes: Array<{ name: string; params?: any }>; index?: number }
  ) => {
    const tabIndexMap: Record<TabName, number> = {
      'my-day': 1,
      reading: 2,
      math: 3,
      drawings: 4,
      settings: 5,
    } as const;

    const routes = [
      { name: 'index' },
      { name: 'my-day' },
      { name: 'reading' as const },
      { name: 'math' as const },
      { name: 'drawings' as const },
      { name: 'settings' as const },
    ].map((r) => {
      if (r.name === tab && nestedState) {
        return { ...r, state: { ...nestedState } } as any;
      }
      return r as any;
    });

    navigation.reset({
      index: 0,
      routes: [
        {
          name: '(tabs)',
          state: {
            index: tabIndexMap[tab],
            routes,
          },
        },
      ],
    });
  };

  const navigateToNoRep = () => {
    resetToTab('reading', {
      routes: [{ name: 'index' }, { name: 'no-rep-track' }],
      index: 1,
    });
  };

  const navigateToBooksDaily = () => {
    resetToTab('reading', {
      routes: [{ name: 'index' }, { name: 'book-track' }, { name: 'books-daily' }],
      index: 1,
    });
  };

  const navigateToDrawings = () => {
    resetToTab('drawings');
  };

  const navigateToSets = () => {
    resetToTab('math', {
      routes: [{ name: 'index' }, { name: 'sets' }],
      index: 1,
    });
  };

  const navigateToEquations = () => {
    resetToTab('math', {
      routes: [{ name: 'index' }, { name: 'equations' }],
      index: 1,
    });
  };

  const readingRoutines: RoutineItem[] = [
    {
      id: 'routine-1',
      title: t('myDay.routine1'),
      isCompleted: isNoRepCompleted,
      onPress: navigateToNoRep,
    },
    {
      id: 'routine-2',
      title: t('myDay.routine2'),
      isCompleted: isSession1Completed,
      onPress: navigateToBooksDaily,
    },
    {
      id: 'routine-3',
      title: t('myDay.routine3'),
      isCompleted: isSession2Completed,
      onPress: navigateToBooksDaily,
    },
    {
      id: 'routine-4',
      title: t('myDay.routine4'),
      isCompleted: isSession3Completed,
      onPress: navigateToBooksDaily,
    },
  ];

  const drawingRoutines: RoutineItem[] = [
    {
      id: 'routine-5',
      title: t('myDay.routine5'),
      isCompleted: isDrawingsCompleted,
      onPress: navigateToDrawings,
    },
  ];

  const mathRoutines: RoutineItem[] =
    currentDay > 30
      ? [
          {
            id: 'eq-session-1',
            title: t('myDay.equationsSet1'),
            isCompleted: isEqSession1Completed,
            onPress: navigateToEquations,
          },
          {
            id: 'eq-session-2',
            title: t('myDay.equationsSet2'),
            isCompleted: isEqSession2Completed,
            onPress: navigateToEquations,
          },
        ]
      : [
          {
            id: 'math-session-1',
            title: t('myDay.mathSet1'),
            isCompleted: isMathSession1Completed,
            onPress: navigateToSets,
          },
          {
            id: 'math-session-2',
            title: t('myDay.mathSet2'),
            isCompleted: isMathSession2Completed,
            onPress: navigateToSets,
          },
        ];

  const allRoutines = [...readingRoutines, ...drawingRoutines, ...mathRoutines];
  const completedCount = allRoutines.filter((r) => r.isCompleted).length;
  const totalCount = allRoutines.length;
  const remainingCount = totalCount - completedCount;
  const completionPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const nextRoutine = allRoutines.find((r) => !r.isCompleted) ?? null;

  return (
    <View style={styles.container}>
      <View style={[styles.canvas, { paddingHorizontal: metrics.screenPadding }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              gap: metrics.sectionGap,
              maxWidth: metrics.maxContentWidth,
              paddingBottom: bottomTabBarHeight + spacing.md,
            },
          ]}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroHeaderCopy}>
                <ThemedText
                  style={styles.heroTitle}
                >{`${t('tabs.myDay')} · ${todayLabel}`}</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  {nextRoutine
                    ? t('myDay.nextStep', { title: nextRoutine.title })
                    : t('myDay.allDone')}
                </ThemedText>
              </View>
              <View style={styles.heroPercentBadge}>
                <ThemedText style={styles.heroPercentText}>{completionPercent}%</ThemedText>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <ThemedText
                  style={styles.statValue}
                >{`${completedCount}/${totalCount}`}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('myDay.completedLabel')}</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>{remainingCount}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('myDay.remainingLabel')}</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>{currentDay}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('myDay.currentStageLabel')}</ThemedText>
              </View>
            </View>

            <View style={styles.heroActions}>
              <Pressable
                style={styles.toggleButton}
                onPress={() => setShowCompleted((prev) => !prev)}
              >
                <ThemedText style={styles.toggleButtonText}>
                  {showCompleted ? t('myDay.showPendingOnly') : t('myDay.showAll')}
                </ThemedText>
              </Pressable>

              {nextRoutine && (
                <Pressable style={styles.nextStepButton} onPress={nextRoutine.onPress}>
                  <ThemedText style={styles.nextStepButtonText}>
                    {t('myDay.openNextStep')}
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </View>

          <RoutineSection
            title={t('myDay.readingSection')}
            routines={readingRoutines}
            badgeVariant="reading"
            showCompleted={showCompleted}
          />
          <RoutineSection
            title={t('myDay.drawingsSection')}
            routines={drawingRoutines}
            badgeVariant="drawings"
            showCompleted={showCompleted}
          />
          <RoutineSection
            title={t('myDay.mathSection')}
            routines={mathRoutines}
            badgeVariant="math"
            showCompleted={showCompleted}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  canvas: {
    flex: 1,
    alignItems: 'stretch',
  },
  scroll: {
    width: '100%',
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: spacing.md,
  },
  heroCard: {
    borderRadius: ForestCampTheme.radius.xl,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...forestCampSoftShadow,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroHeaderCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  heroTitle: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.title,
    fontSize: 20,
    lineHeight: 24,
  },
  heroSubtitle: {
    ...forestCampTypography.body,
    color: ForestCampTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 18,
  },
  heroPercentBadge: {
    minWidth: 74,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: ForestCampTheme.radius.md,
    backgroundColor: '#dcefd1',
    alignItems: 'center',
  },
  heroPercentText: {
    ...forestCampTypography.display,
    color: ForestCampTheme.colors.primaryStrong,
    fontSize: 26,
    lineHeight: 28,
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#dbe9cf',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: ForestCampTheme.colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: ForestCampTheme.radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    backgroundColor: ForestCampTheme.colors.cardMuted,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
  },
  statValue: {
    ...forestCampTypography.heading,
    fontSize: 18,
    lineHeight: 22,
    color: ForestCampTheme.colors.title,
  },
  statLabel: {
    ...forestCampTypography.body,
    fontSize: 12,
    lineHeight: 14,
    color: ForestCampTheme.colors.textMuted,
    textAlign: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#edf6e5',
    paddingHorizontal: spacing.md,
  },
  toggleButtonText: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.primaryStrong,
    fontSize: 13,
    textAlign: 'center',
  },
  nextStepButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.primaryStrong,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ForestCampTheme.colors.primary,
    paddingHorizontal: spacing.md,
  },
  nextStepButtonText: {
    ...forestCampTypography.heading,
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
  },
  sectionCard: {
    borderRadius: ForestCampTheme.radius.lg,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...forestCampSoftShadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.title,
    fontSize: 20,
    lineHeight: 24,
  },
  sectionPercentBadge: {
    minWidth: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    alignItems: 'center',
  },
  sectionPercentReading: {
    backgroundColor: '#dcefd1',
  },
  sectionPercentDrawings: {
    backgroundColor: '#f4ebcc',
  },
  sectionPercentMath: {
    backgroundColor: '#e2e8d2',
  },
  sectionPercentText: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.primaryStrong,
    fontSize: 13,
    lineHeight: 15,
  },
  sectionRows: {
    gap: spacing.sm,
  },
});
