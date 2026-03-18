import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { NumberInput } from '@/components/settings/NumberInput';
import { SwitchSetting } from '@/components/settings/SwitchSetting';
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

export default function DrawingsSettingsScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const {
    drawings,
    updateDrawingsShowCaptions,
    updateDrawingsShowFacts,
    updateDrawingsInterval,
    updateDrawingsRandomOrder,
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
            {t('settings.drawings.description')}
          </ThemedText>

          <View style={styles.settingsContent}>
            <SwitchSetting
              label={t('settings.drawings.showCaptions')}
              description={t('settings.drawings.showCaptionsDescription')}
              value={drawings.showCaptions}
              onValueChange={updateDrawingsShowCaptions}
            />

            <View style={styles.separator} />

            <SwitchSetting
              label={t('settings.drawings.showFacts')}
              description={t('settings.drawings.showFactsDescription')}
              value={drawings.showFacts}
              onValueChange={updateDrawingsShowFacts}
            />

            <View style={styles.separator} />

            <SwitchSetting
              label={t('settings.drawings.randomOrder')}
              description={t('settings.drawings.randomOrderDescription')}
              value={drawings.randomOrder}
              onValueChange={updateDrawingsRandomOrder}
            />

            <View style={styles.separator} />

            <NumberInput
              label={t('settings.drawings.interval')}
              value={drawings.interval}
              onChangeValue={updateDrawingsInterval}
              min={500}
              max={5000}
              step={100}
              suffix="ms"
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
