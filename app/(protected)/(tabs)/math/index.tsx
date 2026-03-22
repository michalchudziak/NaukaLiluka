import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GuideCard } from '@/components/GuideCard';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useEquationsStatus, useMathStatus } from '@/hooks/useMath';
import { useTranslation } from '@/hooks/useTranslation';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const guideImage = require('@/assets/images/guides/math.png');

export default function MathScreen() {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { t } = useTranslation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { isDayCompleted, currentDay, hasGraduatedToEquations } = useMathStatus();
  const { isDayCompleted: isEquationsDayCompleted } = useEquationsStatus();

  const modules = [
    {
      id: 'number-sets',
      title: t('math.numberSets'),
      isCompleted: hasGraduatedToEquations || isDayCompleted,
      onPress: () => router.push('/math/sets'),
    },
    {
      id: 'equations',
      title: t('math.equations.title'),
      isCompleted: hasGraduatedToEquations ? isEquationsDayCompleted : false,
      onPress: () => router.push('/math/equations'),
    },
  ] as const;

  const doneCount = modules.filter((module) => module.isCompleted).length;
  const percent = Math.round((doneCount / modules.length) * 100);
  const nextModule = modules.find((module) => !module.isCompleted) ?? modules[0];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: metrics.screenPadding,
            paddingBottom: tabBarHeight + spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { maxWidth: metrics.maxContentWidth }]}>
          <View style={styles.heroHeader}>
            <ThemedText style={styles.heroTitle}>{t('myDay.mathSection')}</ThemedText>
            <View style={styles.percentBadge}>
              <ThemedText style={styles.percentBadgeText}>{percent}%</ThemedText>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>

          <View style={styles.heroStats}>
            <ThemedText
              style={styles.heroStatsText}
            >{`${doneCount}/2 ${t('myDay.completedLabel')} · ${t('myDay.currentStageLabel')} ${currentDay}`}</ThemedText>
            <Pressable style={styles.nextButton} onPress={nextModule.onPress}>
              <ThemedText style={styles.nextButtonText}>{t('myDay.openNextStep')}</ThemedText>
            </Pressable>
          </View>
        </View>

        <GuideCard image={guideImage} title={t('math.guideTitle')} body={t('math.guideBody')} />

        <View style={[styles.moduleCard, { maxWidth: metrics.maxContentWidth }]}>
          {modules.map((module) => (
            <StateActionRow
              key={module.id}
              title={module.title}
              subtitle={module.isCompleted ? t('myDay.doneStatus') : t('myDay.pendingStatus')}
              isCompleted={module.isCompleted}
              onPress={module.onPress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingTop: spacing.md,
    width: '100%',
    gap: spacing.lg,
  },
  heroCard: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.lg,
    gap: spacing.md,
    alignSelf: 'center',
    ...forestCampSoftShadow,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    ...forestCampTypography.heading,
    fontSize: 18,
    color: ForestCampTheme.colors.title,
  },
  percentBadge: {
    borderRadius: 999,
    backgroundColor: '#dcefd1',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  percentBadgeText: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.primaryStrong,
    fontSize: 14,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#dbe9cf',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: ForestCampTheme.colors.primary,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroStatsText: {
    ...forestCampTypography.body,
    color: ForestCampTheme.colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  nextButton: {
    minHeight: 38,
    borderRadius: ForestCampTheme.radius.sm,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.primaryStrong,
    backgroundColor: ForestCampTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  nextButtonText: {
    ...forestCampTypography.heading,
    color: '#fff',
    fontSize: 12,
  },
  moduleCard: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.md,
    gap: spacing.sm,
    alignSelf: 'center',
    ...forestCampSoftShadow,
  },
});
