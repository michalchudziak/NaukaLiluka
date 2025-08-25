import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

function SettingItem({ title, subtitle, icon, onPress, destructive }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemContent}>
        <View style={[styles.iconContainer, destructive && styles.destructiveIcon]}>
          <Ionicons name={icon} size={24} color={destructive ? '#FF3B30' : '#007AFF'} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={[styles.settingTitle, destructive && styles.destructiveText]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.settingSubtitle}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('settings.reading.sectionTitle')}
          </ThemedText>
          
          <View style={styles.sectionContent}>
            <SettingItem
              title={t('settings.reading.noRepSettings')}
              subtitle={t('settings.reading.noRepSettingsSubtitle')}
              icon="repeat-outline"
              onPress={() => router.push('/(tabs)/settings/reading-norep')}
            />
            
            <View style={styles.separator} />
            
            <SettingItem
              title={t('settings.reading.intervalSettings')}
              subtitle={t('settings.reading.intervalSettingsSubtitle')}
              icon="timer-outline"
              onPress={() => router.push('/(tabs)/settings/reading-interval')}
            />
            
            <View style={styles.separator} />
            
            <SettingItem
              title={t('settings.reading.booksSettings')}
              subtitle={t('settings.reading.booksSettingsSubtitle')}
              icon="book-outline"
              onPress={() => router.push('/(tabs)/settings/reading-books')}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('settings.drawings.sectionTitle')}
          </ThemedText>
          
          <View style={styles.sectionContent}>
            <SettingItem
              title={t('settings.drawings.settings')}
              subtitle={t('settings.drawings.settingsSubtitle')}
              icon="image-outline"
              onPress={() => router.push('/(tabs)/settings/drawings')}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('settings.storage.sectionTitle')}
          </ThemedText>
          
          <View style={styles.sectionContent}>
            <SettingItem
              title={t('settings.cloudData.menuTitle')}
              subtitle={t('settings.cloudData.menuSubtitle')}
              icon="cloud-outline"
              onPress={() => router.push('/(tabs)/settings/cloud-data')}
            />
            
            <View style={styles.separator} />
            
            <SettingItem
              title={t('settings.clearStorage.title')}
              subtitle={t('settings.clearStorage.subtitle')}
              icon="trash-outline"
              onPress={() => router.push('/(tabs)/settings/clear-storage')}
              destructive
            />
            
            <View style={styles.separator} />
            
            <SettingItem
              title={t('settings.viewStorage.title')}
              subtitle={t('settings.viewStorage.subtitle')}
              icon="eye-outline"
              onPress={() => router.push('/(tabs)/settings/view-storage')}
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
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.6,
    marginLeft: 20,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#C8C7CC',
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: '#FFE5E5',
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  settingSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  destructiveText: {
    color: '#FF3B30',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#C8C7CC',
    marginLeft: 60,
  },
});