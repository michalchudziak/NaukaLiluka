import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { format, isToday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';
import { useDrawingsStore } from '@/store/drawings-store';
import { useEquationsStore } from '@/store/equations-store';
import { useMathStore } from '@/store/math-store';
import { useNoRepStore } from '@/store/no-rep-store';

type RoutineItem = {
  id: string;
  title: string;
  isCompleted: boolean;
  onPress: () => void;
};

export default function MyDayScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { isNoRepPathCompletedToday } = useNoRepStore();
  const bookStore = useBookStore();
  const drawingsStore = useDrawingsStore();
  const { isSessionCompletedToday: isMathSessionCompletedToday, currentDay } = useMathStore();
  const { isSessionCompletedToday: isEqSessionCompletedToday } = useEquationsStore();

  const [isNoRepCompleted, setIsNoRepCompleted] = useState(false);
  const [isSession1Completed, setIsSession1Completed] = useState(false);
  const [isSession2Completed, setIsSession2Completed] = useState(false);
  const [isSession3Completed, setIsSession3Completed] = useState(false);
  const [isDrawingsCompleted, setIsDrawingsCompleted] = useState(false);
  const [isMathSession1Completed, setIsMathSession1Completed] = useState(false);
  const [isMathSession2Completed, setIsMathSession2Completed] = useState(false);
  const [isEqSession1Completed, setIsEqSession1Completed] = useState(false);
  const [isEqSession2Completed, setIsEqSession2Completed] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const todayLabel = useMemo(() => {
    const formatted = format(new Date(), 'EEEE, d MMMM', { locale: pl });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, []);

  useEffect(() => {
    const checkCompletions = async () => {
      const routine1 = isNoRepPathCompletedToday();
      setIsNoRepCompleted(routine1);

      const todayCompletions = bookStore.completedSessions.filter((c) => isToday(c.timestamp));
      const plan = bookStore.getDailyData();

      if (plan && isToday(plan.timestamp)) {
        const session1WordsCompleted = todayCompletions.some(
          (c) => c.session === 'session1' && c.type === 'words'
        );
        const session1SentencesNeeded = plan.sessions.session1.sentences.length > 0;
        const session1SentencesCompleted =
          !session1SentencesNeeded ||
          todayCompletions.some((c) => c.session === 'session1' && c.type === 'sentences');
        setIsSession1Completed(session1WordsCompleted && session1SentencesCompleted);

        const session2WordsCompleted = todayCompletions.some(
          (c) => c.session === 'session2' && c.type === 'words'
        );
        const session2SentencesNeeded = plan.sessions.session2.sentences.length > 0;
        const session2SentencesCompleted =
          !session2SentencesNeeded ||
          todayCompletions.some((c) => c.session === 'session2' && c.type === 'sentences');
        setIsSession2Completed(session2WordsCompleted && session2SentencesCompleted);

        const session3WordsCompleted = todayCompletions.some(
          (c) => c.session === 'session3' && c.type === 'words'
        );
        const session3SentencesNeeded = plan.sessions.session3.sentences.length > 0;
        const session3SentencesCompleted =
          !session3SentencesNeeded ||
          todayCompletions.some((c) => c.session === 'session3' && c.type === 'sentences');
        setIsSession3Completed(session3WordsCompleted && session3SentencesCompleted);
      } else {
        setIsSession1Completed(false);
        setIsSession2Completed(false);
        setIsSession3Completed(false);
      }

      setIsDrawingsCompleted(drawingsStore.getTodayPresentationCount() > 0);

      if (currentDay > 30) {
        const eq1 = isEqSessionCompletedToday('session1');
        const eq2 = isEqSessionCompletedToday('session2');
        setIsEqSession1Completed(eq1);
        setIsEqSession2Completed(eq2);
        setIsMathSession1Completed(false);
        setIsMathSession2Completed(false);
      } else {
        const mathSet1 = isMathSessionCompletedToday('session1');
        const mathSet2 = isMathSessionCompletedToday('session2');
        setIsMathSession1Completed(mathSet1);
        setIsMathSession2Completed(mathSet2);
        setIsEqSession1Completed(false);
        setIsEqSession2Completed(false);
      }
    };

    checkCompletions();
    const interval = setInterval(checkCompletions, 1000);

    return () => clearInterval(interval);
  }, [
    isNoRepPathCompletedToday,
    bookStore.completedSessions,
    bookStore.getDailyData,
    drawingsStore,
    isMathSessionCompletedToday,
    isEqSessionCompletedToday,
    currentDay,
  ]);

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

  const completedCount = allRoutines.filter((routine) => routine.isCompleted).length;
  const totalCount = allRoutines.length;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const completionPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const nextRoutine = allRoutines.find((routine) => !routine.isCompleted) ?? null;

  const sectionPercent = (routines: RoutineItem[]) => {
    if (routines.length === 0) {
      return 0;
    }
    const done = routines.filter((routine) => routine.isCompleted).length;
    return Math.round((done / routines.length) * 100);
  };

  const visibleRoutines = (routines: RoutineItem[]) =>
    showCompleted ? routines : routines.filter((routine) => !routine.isCompleted);

  const renderRoutineSection = (
    title: string,
    routines: RoutineItem[],
    badgeVariant: 'reading' | 'drawings' | 'math'
  ) => {
    const items = visibleRoutines(routines);

    if (items.length === 0) {
      return null;
    }

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
            <ThemedText style={styles.sectionPercentText}>{sectionPercent(routines)}%</ThemedText>
          </View>
        </View>

        <View style={styles.sectionRows}>
          {items.map((routine) => (
            <Pressable
              key={routine.id}
              style={({ pressed }) => [
                styles.routineRow,
                routine.isCompleted && styles.routineRowDone,
                pressed && styles.routineRowPressed,
              ]}
              onPress={routine.onPress}
            >
              <View
                style={[
                  styles.routineStatusDot,
                  routine.isCompleted ? styles.routineStatusDone : styles.routineStatusPending,
                ]}
              />
              <View style={styles.routineTextWrap}>
                <ThemedText style={styles.routineTitle}>{routine.title}</ThemedText>
                <ThemedText style={styles.routineSubtitle}>
                  {routine.isCompleted ? t('myDay.doneStatus') : t('myDay.pendingStatus')}
                </ThemedText>
              </View>
              <ThemedText style={styles.routineArrow}>{routine.isCompleted ? '✓' : '→'}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={[styles.canvas, { paddingHorizontal: metrics.screenPadding }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              gap: metrics.sectionGap,
              maxWidth: metrics.maxContentWidth,
              paddingBottom: bottomTabBarHeight + 12,
            },
          ]}
        >
          <ThemedText style={[styles.title, metrics.isTablet && styles.titleTablet]}>
            {t('myDay.title')}
          </ThemedText>

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

          {renderRoutineSection(t('myDay.readingSection'), readingRoutines, 'reading')}
          {renderRoutineSection(t('myDay.drawingsSection'), drawingRoutines, 'drawings')}
          {renderRoutineSection(t('myDay.mathSection'), mathRoutines, 'math')}
        </ScrollView>
      </View>
    </SafeAreaView>
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
  title: {
    ...forestCampTypography.display,
    fontSize: 32,
    lineHeight: 36,
    color: ForestCampTheme.colors.title,
    textAlign: 'left',
  },
  titleTablet: {
    fontSize: 38,
    lineHeight: 42,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 10,
  },
  heroCard: {
    borderRadius: ForestCampTheme.radius.xl,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: 16,
    gap: 12,
    ...forestCampSoftShadow,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroHeaderCopy: {
    flex: 1,
    gap: 4,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: ForestCampTheme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
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
    gap: 8,
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
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
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
    padding: 14,
    gap: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    gap: 8,
  },
  routineRow: {
    minHeight: 64,
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routineRowDone: {
    backgroundColor: '#f3f9ec',
  },
  routineRowPressed: {
    opacity: 0.75,
  },
  routineStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  routineStatusPending: {
    backgroundColor: ForestCampTheme.colors.warning,
  },
  routineStatusDone: {
    backgroundColor: ForestCampTheme.colors.success,
  },
  routineTextWrap: {
    flex: 1,
    gap: 2,
  },
  routineTitle: {
    ...forestCampTypography.heading,
    fontSize: 16,
    lineHeight: 20,
    color: ForestCampTheme.colors.title,
  },
  routineSubtitle: {
    ...forestCampTypography.body,
    fontSize: 13,
    lineHeight: 16,
    color: ForestCampTheme.colors.textMuted,
  },
  routineArrow: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.primaryStrong,
    fontSize: 20,
    lineHeight: 20,
  },
});
