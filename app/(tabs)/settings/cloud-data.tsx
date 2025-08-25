import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settings-store';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';

export default function CloudDataScreen() {
  const { t } = useTranslation();
  const { useCloudData, updateUseCloudData } = useSettingsStore();

  const handleToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        t('settings.cloudData.enableTitle'),
        t('settings.cloudData.enableMessage'),
        [
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
        ]
      );
    } else {
      await updateUseCloudData(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>
                  {t('settings.cloudData.title')}
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  {t('settings.cloudData.description')}
                </ThemedText>
              </View>
              <Switch
                value={useCloudData}
                onValueChange={handleToggle}
                trackColor={{ false: '#767577', true: '#34C759' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>
            {t('settings.cloudData.infoTitle')}
          </ThemedText>
          <ThemedText style={styles.infoText}>
            {t('settings.cloudData.infoText')}
          </ThemedText>
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#C8C7CC',
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
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  infoSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.6,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  statusSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    opacity: 0.8,
  },
});