import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/hooks/useTranslation';
import { widgetService } from '@/services/widgetService';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  const tabBarHeight = useBottomTabBarHeight();

  const handleCompleteAllRoutines = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Widgets are only available on iOS devices.');
      return;
    }

    try {
      await widgetService.initialize();
      
      // Complete all routines
      await widgetService.completeRoutine(1);
      await widgetService.completeRoutine(2);
      await widgetService.completeRoutine(3);
      await widgetService.completeRoutine(4);
      await widgetService.completeRoutine(5);
      
      Alert.alert('Success', 'All routines have been marked as complete in the widget!');
    } catch (error) {
      Alert.alert('Error', `Failed to update widget: ${error}`);
    }
  };

  const handleResetAllRoutines = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Widgets are only available on iOS devices.');
      return;
    }

    try {
      await widgetService.initialize();
      
      // Reset all routines
      await widgetService.resetRoutine(1);
      await widgetService.resetRoutine(2);
      await widgetService.resetRoutine(3);
      await widgetService.resetRoutine(4);
      await widgetService.resetRoutine(5);
      
      Alert.alert('Success', 'All routines have been reset in the widget!');
    } catch (error) {
      Alert.alert('Error', `Failed to update widget: ${error}`);
    }
  };

  const handleForceRefreshWidget = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Widgets are only available on iOS devices.');
      return;
    }

    try {
      const NativeModules = require('react-native').NativeModules;
      console.log('NativeModules', Object.keys(NativeModules));
      const WidgetModule = NativeModules.ReactNativeWidgetExtension;
      
      if (WidgetModule?.forceRefreshWidget) {
        const result = await WidgetModule.forceRefreshWidget();
        
        if (result.error) {
          Alert.alert('Error', result.error);
        } else {
          Alert.alert(
            'Widget Status',
            `R1: ${result.routine1 ? '✓' : '○'}\n` +
            `R2: ${result.routine2 ? '✓' : '○'}\n` +
            `R3: ${result.routine3 ? '✓' : '○'}\n` +
            `R4: ${result.routine4 ? '✓' : '○'}\n` +
            `R5: ${result.routine5 ? '✓' : '○'}\n\n` +
            `${result.message || 'Widget refreshed'}`
          );
        }
      } else {
        Alert.alert('Error', 'Widget module not available');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to refresh widget: ${error}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: tabBarHeight }} showsVerticalScrollIndicator={false}>
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

        {Platform.OS === 'ios' && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Widget iOS
            </ThemedText>
            
            <View style={styles.sectionContent}>
              <SettingItem
                title="Zaznacz wszystkie rutyny"
                subtitle="Oznacz wszystkie dzisiejsze rutyny jako ukończone"
                icon="checkmark-circle-outline"
                onPress={handleCompleteAllRoutines}
              />
              
              <View style={styles.separator} />
              
              <SettingItem
                title="Wyczyść wszystkie rutyny"
                subtitle="Resetuj wszystkie dzisiejsze rutyny"
                icon="close-circle-outline"
                onPress={handleResetAllRoutines}
              />
              
              <View style={styles.separator} />
              
              <SettingItem
                title="Wymuś odświeżenie widgetu"
                subtitle="Debugowanie - sprawdź stan i odśwież widget"
                icon="refresh-outline"
                onPress={handleForceRefreshWidget}
              />
            </View>
          </View>
        )}

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