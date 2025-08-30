import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { isToday } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';
import { useDrawingsStore } from '@/store/drawings-store';
import { useMathStore } from '@/store/math-store';
import { useNoRepStore } from '@/store/no-rep-store';

export default function MyDayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { isNoRepPathCompletedToday } = useNoRepStore();
  const bookStore = useBookStore();
  const drawingsStore = useDrawingsStore();
  const { isSessionCompletedToday } = useMathStore();

  const [isNoRepCompleted, setIsNoRepCompleted] = useState(false);
  const [isSession1Completed, setIsSession1Completed] = useState(false);
  const [isSession2Completed, setIsSession2Completed] = useState(false);
  const [isSession3Completed, setIsSession3Completed] = useState(false);
  const [isDrawingsCompleted, setIsDrawingsCompleted] = useState(false);
  const [isMathSession1Completed, setIsMathSession1Completed] = useState(false);
  const [isMathSession2Completed, setIsMathSession2Completed] = useState(false);

  useEffect(() => {
    const checkCompletions = async () => {
      const routine1 = isNoRepPathCompletedToday();
      setIsNoRepCompleted(routine1);

      const todayCompletions = bookStore.bookTrackSessionCompletions.filter((c) =>
        isToday(c.timestamp)
      );
      const plan = bookStore.dailyPlan;

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

      // Check math sessions
      const mathSet1 = isSessionCompletedToday('session1');
      const mathSet2 = isSessionCompletedToday('session2');
      setIsMathSession1Completed(mathSet1);
      setIsMathSession2Completed(mathSet2);
    };

    checkCompletions();
    const interval = setInterval(checkCompletions, 1000);

    return () => clearInterval(interval);
  }, [
    isNoRepPathCompletedToday,
    bookStore.bookTrackSessionCompletions,
    bookStore.dailyPlan,
    drawingsStore,
    isSessionCompletedToday,
  ]);

  const navigateToNoRep = () => {
    router.push('/reading/no-rep-track');
  };

  const navigateToBooksDaily = () => {
    router.push('/reading/books-daily');
  };

  const navigateToDrawings = () => {
    router.push('/drawings');
  };

  const navigateToSets = () => {
    router.push('/math/sets');
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
