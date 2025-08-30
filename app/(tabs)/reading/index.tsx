import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';
import { useNoRepStore } from '@/store/no-rep-store';

export default function ReadingScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();
  const router = useRouter();
  const noRepStore = useNoRepStore();
  const bookStore = useBookStore();
  const isNoRepPathCompleted = noRepStore.isNoRepPathCompletedToday();
  const isBookTrackCompleted = bookStore.isBookTrackCompletedToday();

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[styles.buttonsContainer, isHorizontal ? styles.horizontal : styles.vertical]}
      >
        <TrackButton
          title={t('reading.bookTrack')}
          isCompleted={isBookTrackCompleted}
          onPress={() => router.push('/reading/book-track')}
        />

        <TrackButton
          title={t('reading.noRepeatTrack')}
          isCompleted={isNoRepPathCompleted}
          onPress={() => router.push('/reading/no-rep-track')}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonsContainer: {
    flex: 1,
    gap: 20,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vertical: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
