import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useMathStore } from '@/store/math-store';

export default function MathScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();
  const router = useRouter();
  const { isDayCompleted } = useMathStore();

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[styles.buttonsContainer, isHorizontal ? styles.horizontal : styles.vertical]}
      >
        <TrackButton
          title={t('math.numberSets')}
          isCompleted={isDayCompleted()}
          onPress={() => router.push('/math/sets')}
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
