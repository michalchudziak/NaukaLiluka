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
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settings-store';

export default function MathSettingsScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const {
    math,
    updateMathEquationsInterval,
    updateMathEquationsCount,
    updateMathNumbersInterval,
    updateMathNumbersCount,
  } = useSettingsStore();

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
            {t('settings.math.description')}
          </ThemedText>

          <View style={styles.settingsContent}>
            <NumberInput
              label={t('settings.math.numbersInterval')}
              value={math.numbers.interval}
              onChangeValue={updateMathNumbersInterval}
              min={200}
              max={5000}
              step={100}
              suffix="ms"
            />

            <View style={styles.separator} />

            <NumberInput
              label={t('settings.math.numbersCount')}
              value={math.numbers.numberCount}
              onChangeValue={updateMathNumbersCount}
              min={1}
              max={50}
            />

            <View style={styles.separator} />

            <NumberInput
              label={t('settings.math.equationsInterval')}
              value={math.equations.interval}
              onChangeValue={updateMathEquationsInterval}
              min={500}
              max={5000}
              step={100}
              suffix="ms"
            />

            <View style={styles.separator} />

            <NumberInput
              label={t('settings.math.equationsCount')}
              value={math.equations.equationCount}
              onChangeValue={updateMathEquationsCount}
              min={1}
              max={50}
            />
          </View>
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
  separator: {
    height: 1,
    backgroundColor: '#dbe8cf',
    marginLeft: 16,
  },
});
