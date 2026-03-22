import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { GuideCard } from '@/components/GuideCard';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useBookStatus } from '@/hooks/useBooks';
import { useTranslation } from '@/hooks/useTranslation';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const guideImage = require('@/assets/images/guides/book.png');

export default function BookTrackScreen() {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { t } = useTranslation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const bookStatus = useBookStatus();
  const isTrainingCompleted = bookStatus?.isDayCompleted ?? false;

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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + spacing.lg,
            paddingHorizontal: metrics.screenPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GuideCard
          image={guideImage}
          title={t('bookTrack.guideTitle')}
          body={t('bookTrack.guideBody')}
        />

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
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  actionsCard: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.lg,
    gap: spacing.md,
    alignSelf: 'center',
    ...forestCampSoftShadow,
  },
});
