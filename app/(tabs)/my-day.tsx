import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { isToday } from 'date-fns';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';
import { useDrawingsStore } from '@/store/drawings-store';
import { useEquationsStore } from '@/store/equations-store';
import { useMathStore } from '@/store/math-store';
import { useNoRepStore } from '@/store/no-rep-store';

export default function MyDayScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const bottomTabBarHeight = useBottomTabBarHeight();
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

  useEffect(() => {
    const checkCompletions = async () => {
      const routine1 = isNoRepPathCompletedToday();
      setIsNoRepCompleted(routine1);

      const todayCompletions = bookStore.completedSessions.filter((c) => isToday(c.timestamp));
      const plan = bookStore.getDailyData();

      let routine2 = false;
      let routine3 = false;
      let routine4 = false;

      if (plan && isToday(plan.timestamp)) {
        const session1WordsCompleted = todayCompletions.some(
          (c) => c.session === 'session1' && c.type === 'words'
        );
        const session1SentencesNeeded = plan.sessions.session1.sentences.length > 0;
        const session1SentencesCompleted =
          !session1SentencesNeeded ||
          todayCompletions.some((c) => c.session === 'session1' && c.type === 'sentences');
        routine2 = session1WordsCompleted && session1SentencesCompleted;
        setIsSession1Completed(routine2);

        const session2WordsCompleted = todayCompletions.some(
          (c) => c.session === 'session2' && c.type === 'words'
        );
        const session2SentencesNeeded = plan.sessions.session2.sentences.length > 0;
        const session2SentencesCompleted =
          !session2SentencesNeeded ||
          todayCompletions.some((c) => c.session === 'session2' && c.type === 'sentences');
        routine3 = session2WordsCompleted && session2SentencesCompleted;
        setIsSession2Completed(routine3);

        const session3WordsCompleted = todayCompletions.some(
          (c) => c.session === 'session3' && c.type === 'words'
        );
        const session3SentencesNeeded = plan.sessions.session3.sentences.length > 0;
        const session3SentencesCompleted =
          !session3SentencesNeeded ||
          todayCompletions.some((c) => c.session === 'session3' && c.type === 'sentences');
        routine4 = session3WordsCompleted && session3SentencesCompleted;
        setIsSession3Completed(routine4);
      } else {
        setIsSession1Completed(false);
        setIsSession2Completed(false);
        setIsSession3Completed(false);
      }

      const routine5 = drawingsStore.getTodayPresentationCount() > 0;
      setIsDrawingsCompleted(routine5);

      // Check math or equations sessions depending on progress
      if (currentDay > 30) {
        const eq1 = isEqSessionCompletedToday('session1');
        const eq2 = isEqSessionCompletedToday('session2');
        setIsEqSession1Completed(eq1);
        setIsEqSession2Completed(eq2);
        // Clear math flags to avoid confusion when switching
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

  // Helper to reset into Tabs with a specific tab active and optional nested stack
  // Keeps all tabs present to avoid affecting the TabBar.
  type TabName = 'my-day' | 'reading' | 'math' | 'drawings' | 'settings' | 'style-lab';

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
      'style-lab': 6,
    } as const;

    const routes = [
      { name: 'index' },
      { name: 'my-day' },
      { name: 'reading' as const },
      { name: 'math' as const },
      { name: 'drawings' as const },
      { name: 'settings' as const },
      { name: 'style-lab' as const },
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
    // Reading stack: Reading index -> No-Rep Track
    resetToTab('reading', {
      routes: [{ name: 'index' }, { name: 'no-rep-track' }],
      index: 1,
    });
  };

  const navigateToBooksDaily = () => {
    // Reading stack: Book Track -> Books Daily
    resetToTab('reading', {
      routes: [{ name: 'index' }, { name: 'book-track' }, { name: 'books-daily' }],
      index: 1,
    });
  };

  const navigateToDrawings = () => {
    // Switch to Drawings tab (list). No nested stack needed here.
    resetToTab('drawings');
  };

  const navigateToSets = () => {
    // Math stack: Math index -> Sets
    resetToTab('math', {
      routes: [{ name: 'index' }, { name: 'sets' }],
      index: 1,
    });
  };

  const navigateToEquations = () => {
    // Math stack: Math index -> Equations
    resetToTab('math', {
      routes: [{ name: 'index' }, { name: 'equations' }],
      index: 1,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomTabBarHeight + 10 }]}
      >
        <ThemedText style={styles.title}>{t('myDay.title')}</ThemedText>
        <TrackButton
          title={t('myDay.routine1')}
          isCompleted={isNoRepCompleted}
          onPress={navigateToNoRep}
        />
        <TrackButton
          title={t('myDay.routine2')}
          isCompleted={isSession1Completed}
          onPress={navigateToBooksDaily}
        />
        <TrackButton
          title={t('myDay.routine3')}
          isCompleted={isSession2Completed}
          onPress={navigateToBooksDaily}
        />
        <TrackButton
          title={t('myDay.routine4')}
          isCompleted={isSession3Completed}
          onPress={navigateToBooksDaily}
        />
        <TrackButton
          title={t('myDay.routine5')}
          isCompleted={isDrawingsCompleted}
          onPress={navigateToDrawings}
        />
        {currentDay > 30 ? (
          <>
            <TrackButton
              title={t('myDay.equationsSet1')}
              isCompleted={isEqSession1Completed}
              onPress={navigateToEquations}
            />
            <TrackButton
              title={t('myDay.equationsSet2')}
              isCompleted={isEqSession2Completed}
              onPress={navigateToEquations}
            />
          </>
        ) : (
          <>
            <TrackButton
              title={t('myDay.mathSet1')}
              isCompleted={isMathSession1Completed}
              onPress={navigateToSets}
            />
            <TrackButton
              title={t('myDay.mathSet2')}
              isCompleted={isMathSession2Completed}
              onPress={navigateToSets}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    padding: 20,
    gap: 16,
  },
});
