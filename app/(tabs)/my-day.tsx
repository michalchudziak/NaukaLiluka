import { ThemedText } from '@/components/ThemedText';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';
import { useDrawingsStore } from '@/store/drawings-store';
import { useNoRepStore } from '@/store/no-rep-store';
import { isToday } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

export default function MyDayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isNoRepPathCompletedToday } = useNoRepStore();
  const bookStore = useBookStore();
  const drawingsStore = useDrawingsStore();

  const [isNoRepCompleted, setIsNoRepCompleted] = useState(false);
  const [isSession1Completed, setIsSession1Completed] = useState(false);
  const [isSession2Completed, setIsSession2Completed] = useState(false);
  const [isSession3Completed, setIsSession3Completed] = useState(false);
  const [isDrawingsCompleted, setIsDrawingsCompleted] = useState(false);

  useEffect(() => {
    const checkCompletions = () => {
      setIsNoRepCompleted(isNoRepPathCompletedToday());

      const todayCompletions = bookStore.bookTrackSessionCompletions.filter(c => isToday(c.timestamp));
      const plan = bookStore.dailyPlan;

      if (plan && isToday(plan.timestamp)) {
        const session1WordsCompleted = todayCompletions.some(c => c.session === 'session1' && c.type === 'words');
        const session1SentencesNeeded = plan.sessions.session1.sentences.length > 0;
        const session1SentencesCompleted = !session1SentencesNeeded || todayCompletions.some(c => c.session === 'session1' && c.type === 'sentences');
        setIsSession1Completed(session1WordsCompleted && session1SentencesCompleted);

        const session2WordsCompleted = todayCompletions.some(c => c.session === 'session2' && c.type === 'words');
        const session2SentencesNeeded = plan.sessions.session2.sentences.length > 0;
        const session2SentencesCompleted = !session2SentencesNeeded || todayCompletions.some(c => c.session === 'session2' && c.type === 'sentences');
        setIsSession2Completed(session2WordsCompleted && session2SentencesCompleted);

        const session3WordsCompleted = todayCompletions.some(c => c.session === 'session3' && c.type === 'words');
        const session3SentencesNeeded = plan.sessions.session3.sentences.length > 0;
        const session3SentencesCompleted = !session3SentencesNeeded || todayCompletions.some(c => c.session === 'session3' && c.type === 'sentences');
        setIsSession3Completed(session3WordsCompleted && session3SentencesCompleted);
      } else {
        setIsSession1Completed(false);
        setIsSession2Completed(false);
        setIsSession3Completed(false);
      }

      setIsDrawingsCompleted(drawingsStore.getTodayPresentationCount() > 0);
    };

    checkCompletions();
    const interval = setInterval(checkCompletions, 1000);

    return () => clearInterval(interval);
  }, [
    isNoRepPathCompletedToday,
    bookStore.bookTrackSessionCompletions,
    bookStore.dailyPlan,
    drawingsStore
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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