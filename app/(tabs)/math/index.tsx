import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
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
            <Pressable
              key={module.id}
              style={({ pressed }) => [
                styles.moduleRow,
                module.isCompleted && styles.moduleRowDone,
                pressed && styles.moduleRowPressed,
              ]}
              onPress={module.onPress}
            >
              <View
                style={[
                  styles.moduleDot,
                  module.isCompleted ? styles.moduleDotDone : styles.moduleDotPending,
                ]}
              />
              <View style={styles.moduleTextWrap}>
                <ThemedText style={styles.moduleTitle}>{module.title}</ThemedText>
                <ThemedText style={styles.moduleSubtitle}>
                  {module.isCompleted ? t('myDay.doneStatus') : t('myDay.pendingStatus')}
                </ThemedText>
              </View>
              <ThemedText style={styles.moduleArrow}>{module.isCompleted ? '✓' : '→'}</ThemedText>
            </Pressable>
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
    paddingTop: 12,
    width: '100%',
  },
  title: {
    ...forestCampTypography.display,
    fontSize: 30,
    lineHeight: 34,
    color: ForestCampTheme.colors.title,
    marginBottom: 14,
  },
  titleTablet: {
    fontSize: 38,
    lineHeight: 42,
    marginBottom: 18,
  },
  heroCard: {
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: 14,
    gap: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    gap: 8,
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
    paddingHorizontal: 12,
  },
  nextButtonText: {
    ...forestCampTypography.heading,
    color: '#fff',
    fontSize: 12,
  },
  moduleCard: {
    marginTop: 14,
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: 12,
    gap: 8,
    ...forestCampSoftShadow,
  },
  moduleRow: {
    minHeight: 64,
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moduleRowDone: {
    backgroundColor: '#f3f9ec',
  },
  moduleRowPressed: {
    opacity: 0.75,
  },
  moduleDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  moduleDotPending: {
    backgroundColor: ForestCampTheme.colors.warning,
  },
  moduleDotDone: {
    backgroundColor: ForestCampTheme.colors.success,
  },
  moduleTextWrap: {
    flex: 1,
  },
  moduleTitle: {
    ...forestCampTypography.heading,
    fontSize: 17,
    color: ForestCampTheme.colors.title,
  },
  moduleSubtitle: {
    ...forestCampTypography.body,
    marginTop: 2,
    fontSize: 13,
    color: ForestCampTheme.colors.textMuted,
  },
  moduleArrow: {
    ...forestCampTypography.heading,
    fontSize: 20,
    color: ForestCampTheme.colors.primaryStrong,
  },
});
