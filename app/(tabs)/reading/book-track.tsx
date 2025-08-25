import { Button } from '@/components/Button';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';

export default function BookTrackScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const handleTrainingPress = () => {
    router.push('/reading/books-daily');
  };

  const handleBooksPress = () => {
    // TODO: Implement books functionality

  };

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight }]}>
      <ThemedView style={[styles.buttonsContainer, isHorizontal ? styles.horizontal : styles.vertical]}>
        <TrackButton 
          title={t('bookTrack.training')}
          isCompleted={false}
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