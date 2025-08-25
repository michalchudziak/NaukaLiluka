import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/hooks/useTranslation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

export default function BooksDailyScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight }]}>
      <ThemedText style={styles.placeholder}>
        {t('booksDaily.title')}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 18,
    opacity: 0.7,
  },
});