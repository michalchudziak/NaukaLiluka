import { Alert, ScrollView, StyleSheet, Switch, useWindowDimensions, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settings-store';

export default function CloudDataScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { useCloudData, updateUseCloudData } = useSettingsStore();

  const handleToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(t('settings.cloudData.enableTitle'), t('settings.cloudData.enableMessage'), [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.enable'),
          onPress: async () => {
            await updateUseCloudData(true);
          },
        },
      ]);
    } else {
      await updateUseCloudData(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>{t('settings.cloudData.title')}</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  {t('settings.cloudData.description')}
                </ThemedText>
              </View>
              <Switch
                value={useCloudData}
                onValueChange={handleToggle}
                trackColor={{ false: '#d3e2c5', true: ForestCampTheme.colors.success }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#9eb08a"
              />
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>{t('settings.cloudData.infoTitle')}</ThemedText>
          <ThemedText style={styles.infoText}>{t('settings.cloudData.infoText')}</ThemedText>
        </View>

        {useCloudData && (
          <View style={styles.statusSection}>
            <View style={styles.statusItem}>
              <View style={styles.statusDot} />
              <ThemedText style={styles.statusText}>
                {t('settings.cloudData.statusConnected')}
              </ThemedText>
            </View>
          </View>
        )}
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
    paddingTop: 14,
    paddingBottom: 20,
  },
  section: {
    marginTop: 10,
  },
  sectionContent: {
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    borderRadius: ForestCampTheme.radius.lg,
    overflow: 'hidden',
    ...forestCampSoftShadow,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    ...forestCampTypography.heading,
    fontSize: 17,
    color: ForestCampTheme.colors.title,
    marginBottom: 4,
  },
  settingDescription: {
    ...forestCampTypography.body,
    fontSize: 13,
    color: ForestCampTheme.colors.textMuted,
  },
  infoSection: {
    marginTop: 18,
    paddingHorizontal: 10,
  },
  infoTitle: {
    ...forestCampTypography.heading,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
    marginBottom: 8,
  },
  infoText: {
    ...forestCampTypography.body,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
    lineHeight: 20,
  },
  statusSection: {
    marginTop: 18,
    paddingHorizontal: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: ForestCampTheme.colors.success,
    marginRight: 8,
  },
  statusText: {
    ...forestCampTypography.heading,
    fontSize: 14,
    color: ForestCampTheme.colors.title,
  },
});
