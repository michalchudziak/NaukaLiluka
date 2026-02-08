import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

function SettingItem({ title, subtitle, icon, onPress, destructive }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.settingItemContent}>
        <View style={[styles.iconContainer, destructive && styles.destructiveIcon]}>
          <Ionicons
            name={icon}
            size={22}
            color={
              destructive ? ForestCampTheme.colors.danger : ForestCampTheme.colors.primaryStrong
            }
          />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={[styles.settingTitle, destructive && styles.destructiveText]}>
            {title}
          </ThemedText>
          {subtitle && <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>}
        </View>
        <Ionicons name="chevron-forward" size={18} color={ForestCampTheme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + 16,
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.pageTitle, metrics.isTablet && styles.pageTitleTablet]}>
          {t('tabs.settings')}
        </ThemedText>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.reading.sectionTitle')}</ThemedText>

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

            <View style={styles.separator} />

            <SettingItem
              title={t('settings.reading.wordSpacingSettings')}
              subtitle={t('settings.reading.wordSpacingSettingsSubtitle')}
              icon="text-outline"
              onPress={() => router.push('/(tabs)/settings/word-spacing')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.drawings.sectionTitle')}</ThemedText>

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
          <ThemedText style={styles.sectionTitle}>{t('settings.math.sectionTitle')}</ThemedText>

          <View style={styles.sectionContent}>
            <SettingItem
              title={t('settings.math.settings')}
              subtitle={t('settings.math.settingsSubtitle')}
              icon="calculator-outline"
              onPress={() => router.push('/(tabs)/settings/math')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.storage.sectionTitle')}</ThemedText>

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
    paddingTop: 12,
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
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    ...forestCampTypography.heading,
    fontSize: 15,
    lineHeight: 18,
    color: ForestCampTheme.colors.textMuted,
    marginLeft: 10,
    marginBottom: 8,
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
    backgroundColor: ForestCampTheme.colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#e4f0da',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: '#fbe0d8',
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    ...forestCampTypography.heading,
    fontSize: 17,
    lineHeight: 21,
    color: ForestCampTheme.colors.title,
  },
  settingSubtitle: {
    ...forestCampTypography.body,
    fontSize: 13,
    color: ForestCampTheme.colors.textMuted,
    marginTop: 2,
  },
  destructiveText: {
    color: ForestCampTheme.colors.danger,
  },
  separator: {
    height: 1,
    backgroundColor: '#dbe8cf',
    marginLeft: 62,
  },
});
