import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';

export default function BookTrackScreen() {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { t } = useTranslation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const isDayCompleted = useBookStore((state) => state.isDayCompleted);
  const isTrainingCompleted = isDayCompleted();

  const handleTrainingPress = () => {
    router.push('/reading/books-daily');
  };

  const handleBooksPress = () => {
    router.push('/reading/books-list');
  };

  const actions = [
    {
      id: 'training',
      title: t('bookTrack.training'),
      subtitle: isTrainingCompleted ? t('myDay.doneStatus') : t('myDay.pendingStatus'),
      isCompleted: isTrainingCompleted,
      onPress: handleTrainingPress,
    },
    {
      id: 'books',
      title: t('bookTrack.books'),
      subtitle: t('booksList.title'),
      isCompleted: false,
      onPress: handleBooksPress,
    },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.content,
          {
            marginBottom: tabBarHeight + 8,
            paddingHorizontal: metrics.screenPadding,
          },
        ]}
      >
        <ThemedText style={[styles.title, metrics.isTablet && styles.titleTablet]}>
          {t('bookTrack.title')}
        </ThemedText>
        <ThemedView
          style={[
            styles.actionsCard,
            {
              maxWidth: metrics.maxContentWidth,
            },
          ]}
        >
          {actions.map((action) => (
            <StateActionRow
              key={action.id}
              title={action.title}
              subtitle={action.subtitle}
              isCompleted={action.isCompleted}
              onPress={action.onPress}
            />
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  content: {
    flex: 1,
    paddingTop: 12,
    width: '100%',
  },
  title: {
    ...forestCampTypography.display,
    fontSize: 30,
    lineHeight: 34,
    color: ForestCampTheme.colors.title,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  titleTablet: {
    fontSize: 36,
    lineHeight: 40,
    marginBottom: 18,
  },
  actionsCard: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: 16,
    gap: 10,
    alignSelf: 'center',
    ...forestCampSoftShadow,
  },
});
