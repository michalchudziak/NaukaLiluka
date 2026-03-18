import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useEquationsStore } from '@/store/equations-store';
import { useMathStore } from '@/store/math-store';

export default function MathScreen() {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { t } = useTranslation();
  const router = useRouter();
  const { isDayCompleted, currentDay } = useMathStore();
  const { isDayCompleted: isEquationsDayCompleted } = useEquationsStore();

  const modules = [
    {
      id: 'number-sets',
      title: t('math.numberSets'),
      isCompleted: isDayCompleted(),
      onPress: () => router.push('/math/sets'),
    },
    {
      id: 'equations',
      title: t('math.equations.title'),
      isCompleted: isEquationsDayCompleted(),
      onPress: () => router.push('/math/equations'),
    },
  ] as const;

  const doneCount = modules.filter((module) => module.isCompleted).length;
  const percent = Math.round((doneCount / modules.length) * 100);
  const nextModule = modules.find((module) => !module.isCompleted) ?? modules[0];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: metrics.screenPadding }]}>
        <ThemedText style={[styles.title, metrics.isTablet && styles.titleTablet]}>
          {t('tabs.math')}
        </ThemedText>

        <View style={styles.heroCard}>
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

        <View style={styles.moduleCard}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
    width: '100%',
  },
  title: {
    ...forestCampTypography.display,
    fontSize: 30,
    lineHeight: 34,
    color: ForestCampTheme.colors.title,
    marginBottom: spacing.lg,
  },
  titleTablet: {
    fontSize: 38,
    lineHeight: 42,
    marginBottom: spacing.xl,
  },
  heroCard: {
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.lg,
    gap: spacing.md,
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
    marginTop: spacing.lg,
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.md,
    gap: spacing.sm,
    ...forestCampSoftShadow,
  },
});
