import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
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
import type { DailyCommitmentMinutes } from '@/shared/dailyCommitment';

const commitmentOptions: DailyCommitmentMinutes[] = [2, 5, 10, 15];

export default function ProfileSetupScreen() {
  const { t } = useTranslation();
  const settings = useAppSettings();
  const { completeOnboardingProfile } = useSettingsActions();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const [childAgeMonths, setChildAgeMonths] = useState(settings.onboarding.childAgeMonths ?? 12);
  const [selectedCommitment, setSelectedCommitment] = useState<DailyCommitmentMinutes | null>(
    settings.onboarding.dailyCommitmentMinutes
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings.onboarding.childAgeMonths !== null) {
      setChildAgeMonths(settings.onboarding.childAgeMonths);
    }

    if (settings.onboarding.dailyCommitmentMinutes !== null) {
      setSelectedCommitment(settings.onboarding.dailyCommitmentMinutes);
    }
  }, [settings.onboarding.childAgeMonths, settings.onboarding.dailyCommitmentMinutes]);

  const handleContinue = () => {
    if (selectedCommitment === null || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    completeOnboardingProfile(childAgeMonths, selectedCommitment);
    router.replace('/my-day');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: metrics.screenPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { maxWidth: metrics.maxContentWidth }]}>
          <ThemedText style={styles.eyebrow}>{t('profileSetup.eyebrow')}</ThemedText>
          <ThemedText style={styles.title}>{t('profileSetup.title')}</ThemedText>
          <ThemedText style={styles.description}>{t('profileSetup.description')}</ThemedText>
        </View>

        <View style={[styles.sectionCard, { maxWidth: metrics.maxContentWidth }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{t('profileSetup.ageTitle')}</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              {t('profileSetup.ageDescription')}
            </ThemedText>
          </View>

          <NumberInput
            label={t('profileSetup.ageLabel')}
            value={childAgeMonths}
            onChangeValue={setChildAgeMonths}
            min={0}
            max={144}
            suffix={t('profileSetup.ageSuffix')}
          />
        </View>

        <View style={[styles.sectionCard, { maxWidth: metrics.maxContentWidth }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              {t('profileSetup.commitmentTitle')}
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              {t('profileSetup.commitmentDescription')}
            </ThemedText>
          </View>

          <View style={styles.options}>
            {commitmentOptions.map((minutes) => {
              const isSelected = selectedCommitment === minutes;

              return (
                <Pressable
                  key={minutes}
                  style={({ pressed }) => [
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    pressed && styles.optionCardPressed,
                  ]}
                  onPress={() => setSelectedCommitment(minutes)}
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

        <Button
          title={isSubmitting ? t('profileSetup.saving') : t('profileSetup.continue')}
          onPress={handleContinue}
          disabled={selectedCommitment === null || isSubmitting}
          style={[styles.button, { maxWidth: metrics.maxContentWidth }]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  heroCard: {
    width: '100%',
    alignSelf: 'center',
    padding: spacing.xl,
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    gap: spacing.sm,
    ...forestCampSoftShadow,
  },
  eyebrow: {
    ...forestCampTypography.heading,
    fontSize: 13,
    lineHeight: 16,
    color: ForestCampTheme.colors.primaryStrong,
    textTransform: 'uppercase',
  },
  title: {
    ...forestCampTypography.display,
    fontSize: 28,
    lineHeight: 34,
    color: ForestCampTheme.colors.title,
  },
  description: {
    ...forestCampTypography.body,
    fontSize: 16,
    lineHeight: 23,
    color: ForestCampTheme.colors.textMuted,
  },
  sectionCard: {
    width: '100%',
    alignSelf: 'center',
    padding: spacing.lg,
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
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
  button: {
    width: '100%',
    alignSelf: 'center',
    flex: 0,
  },
});
