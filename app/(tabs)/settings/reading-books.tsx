import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settings-store';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

interface SwitchSettingProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SwitchSetting({ label, description, value, onValueChange }: SwitchSettingProps) {
  return (
    <View style={styles.switchContainer}>
      <View style={styles.switchTextContainer}>
        <ThemedText style={styles.switchLabel}>{label}</ThemedText>
        {description && (
          <ThemedText style={styles.switchDescription}>{description}</ThemedText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function ReadingBooksSettingsScreen() {
  const { t } = useTranslation();
  const {
    reading,
    updateReadingBooksAllowAll,
    hydrate
  } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.reading.booksDescription')}
          </ThemedText>
          
          <View style={styles.settingsContent}>
            <SwitchSetting
              label={t('settings.reading.allowAllBooks')}
              description={t('settings.reading.allowAllBooksDescription')}
              value={reading.books.allowAllBooks}
              onValueChange={updateReadingBooksAllowAll}
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 30,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  settingsContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#C8C7CC',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
  switchDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
    lineHeight: 18,
  },
});