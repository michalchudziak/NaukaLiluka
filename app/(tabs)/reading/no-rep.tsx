import { StyleSheet, useWindowDimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { useTranslation } from '@/hooks/useTranslation';

export default function NoRepScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.buttonsContainer, isHorizontal ? styles.horizontal : styles.vertical]}>
        <TrackButton 
          title={t('noRep.words')}
          isCompleted={false}
        />
        
        <TrackButton 
          title={t('noRep.sentences')}
          isCompleted={false}
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