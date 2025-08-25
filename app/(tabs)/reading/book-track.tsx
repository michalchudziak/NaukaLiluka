import { Button } from '@/components/Button';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoutinesStore } from '@/store/routines-store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';

export default function BookTrackScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const isBookTrackCompletedToday = useRoutinesStore(state => state.isBookTrackCompletedToday);
  const isTrainingCompleted = isBookTrackCompletedToday();

  const handleTrainingPress = () => {
    router.push('/reading/books-daily');
  };

  const handleBooksPress = () => {
    router.push('/reading/books-list');
  };

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight }]}>
      <ThemedView style={[styles.buttonsContainer, isHorizontal ? styles.horizontal : styles.vertical]}>
        <TrackButton 
          title={t('bookTrack.training')}
          isCompleted={isTrainingCompleted}
          onPress={handleTrainingPress}
        />
      
        <Button 
          title={t('bookTrack.books')}
          onPress={handleBooksPress}
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