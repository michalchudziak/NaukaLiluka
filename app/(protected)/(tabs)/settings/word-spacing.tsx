import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { NumberInput } from '@/components/settings/NumberInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useAppSettings, useSettingsActions } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';

function PreviewText({ spacing }: { spacing: number }) {
  const { t } = useTranslation();
  const spaces = ' '.repeat(spacing);
  const previewText = ['To', 'jest', 'przykładowy', 'tekst'].join(spaces);

  return (
    <View style={styles.previewContainer}>
      <ThemedText style={styles.previewLabel}>
        {t('settings.reading.wordSpacingPreview')}
      </ThemedText>
      <View style={styles.previewBox}>
        <ThemedText style={styles.previewText}>{previewText}</ThemedText>
      </View>
    </View>
  );
}

export default function WordSpacingSettingsScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { reading } = useAppSettings();
  const { updateReadingWordSpacing } = useSettingsActions();

  const wordSpacing = reading.wordSpacing ?? 1;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
            paddingBottom: tabBarHeight + spacing.sm,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.reading.wordSpacingDescription')}
          </ThemedText>

          <View style={styles.settingsContent}>
            <NumberInput
              label={t('settings.reading.wordSpacing')}
              value={wordSpacing}
              onChangeValue={updateReadingWordSpacing}
              min={1}
              max={10}
              suffix="x"
            />
          </View>

          <PreviewText spacing={wordSpacing} />

          <ThemedText style={styles.hint}>{t('settings.reading.wordSpacingHint')}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionDescription: {
    ...forestCampTypography.body,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  settingsContent: {
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    borderRadius: ForestCampTheme.radius.lg,
    overflow: 'hidden',
    ...forestCampSoftShadow,
  },
  hint: {
    ...forestCampTypography.body,
    fontSize: 13,
    color: ForestCampTheme.colors.textMuted,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
  previewContainer: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
  },
  previewLabel: {
    ...forestCampTypography.body,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
    marginBottom: spacing.md,
  },
  previewBox: {
    backgroundColor: ForestCampTheme.colors.cardMuted,
    borderRadius: ForestCampTheme.radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
  },
  previewText: {
    ...forestCampTypography.heading,
    fontSize: 18,
    color: ForestCampTheme.colors.title,
  },
});
