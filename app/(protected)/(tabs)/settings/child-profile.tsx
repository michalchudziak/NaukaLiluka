import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NumberInput } from '@/components/settings/NumberInput';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useAppSettings, useSettingsActions } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { DAILY_COMMITMENT_OPTIONS, type DailyCommitmentMinutes } from '@/shared/dailyCommitment';

export default function ChildProfileSettingsScreen() {
  const { t } = useTranslation();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const settings = useAppSettings();
  const { completeOnboardingProfile } = useSettingsActions();
  const childAgeMonths = settings.onboarding.childAgeMonths ?? 12;
  const selectedCommitment = settings.onboarding.dailyCommitmentMinutes ?? 15;

  const updateProfile = (nextAgeMonths: number, nextCommitment: DailyCommitmentMinutes) => {
    if (
      nextAgeMonths === settings.onboarding.childAgeMonths &&
      nextCommitment === settings.onboarding.dailyCommitmentMinutes
    ) {
      return;
    }

    completeOnboardingProfile(nextAgeMonths, nextCommitment);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
            paddingBottom: bottomTabBarHeight + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.pageTitle, metrics.isTablet && styles.pageTitleTablet]}>
          {t('settings.childProfile.title')}
        </ThemedText>
        <ThemedText style={styles.pageDescription}>{t('settings.childProfile.description')}</ThemedText>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{t('profileSetup.ageTitle')}</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              {t('profileSetup.ageDescription')}
            </ThemedText>
          </View>

          <NumberInput
            label={t('profileSetup.ageLabel')}
            value={childAgeMonths}
            onChangeValue={(value) => updateProfile(value, selectedCommitment)}
            min={0}
            max={144}
            suffix={t('profileSetup.ageSuffix')}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{t('profileSetup.commitmentTitle')}</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              {t('profileSetup.commitmentDescription')}
            </ThemedText>
          </View>

          <View style={styles.options}>
            {DAILY_COMMITMENT_OPTIONS.map((minutes) => {
              const isSelected = selectedCommitment === minutes;

              return (
                <Pressable
                  key={minutes}
                  style={({ pressed }) => [
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    pressed && styles.optionCardPressed,
                  ]}
                  onPress={() => updateProfile(childAgeMonths, minutes)}
                >
                  <View style={styles.optionHeader}>
                    <ThemedText style={styles.optionTitle}>
                      {t('profileSetup.optionTitle', { minutes })}
                    </ThemedText>
                    {isSelected ? (
                      <View style={styles.optionBadge}>
                        <ThemedText style={styles.optionBadgeText}>
                          {t('profileSetup.selected')}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                  <ThemedText style={styles.optionBody}>
                    {t(`profileSetup.commitmentOptions.${minutes}`)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  pageTitle: {
    ...forestCampTypography.display,
    fontSize: 30,
    lineHeight: 34,
    color: ForestCampTheme.colors.title,
  },
  pageTitleTablet: {
    fontSize: 38,
    lineHeight: 42,
  },
  pageDescription: {
    ...forestCampTypography.body,
    fontSize: 15,
    lineHeight: 22,
    color: ForestCampTheme.colors.textMuted,
  },
  card: {
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.lg,
    gap: spacing.lg,
    ...forestCampSoftShadow,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...forestCampTypography.heading,
    fontSize: 20,
    lineHeight: 24,
    color: ForestCampTheme.colors.title,
  },
  sectionDescription: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.textMuted,
  },
  options: {
    gap: spacing.md,
  },
  optionCard: {
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: '#ffffff',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  optionCardSelected: {
    borderColor: ForestCampTheme.colors.primaryStrong,
    backgroundColor: '#f2faee',
  },
  optionCardPressed: {
    opacity: 0.85,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionTitle: {
    ...forestCampTypography.heading,
    fontSize: 18,
    lineHeight: 22,
    color: ForestCampTheme.colors.title,
    flex: 1,
  },
  optionBadge: {
    borderRadius: 999,
    backgroundColor: ForestCampTheme.colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  optionBadgeText: {
    ...forestCampTypography.heading,
    fontSize: 11,
    lineHeight: 14,
    color: '#ffffff',
  },
  optionBody: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.textMuted,
  },
});
