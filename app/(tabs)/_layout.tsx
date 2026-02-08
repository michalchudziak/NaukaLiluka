import { Tabs } from 'expo-router';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  ForestCampTheme,
  forestCampShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function TabLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const isTablet = metrics.isTablet;

  return (
    <Tabs
      initialRouteName="my-day"
      screenOptions={{
        sceneStyle: {
          backgroundColor: ForestCampTheme.colors.background,
        },
        tabBarActiveTintColor: ForestCampTheme.colors.primaryStrong,
        tabBarInactiveTintColor: ForestCampTheme.colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBarBase,
          isTablet ? styles.tabBarTablet : styles.tabBarPhone,
          Platform.OS === 'ios' ? styles.tabBarIos : styles.tabBarDefault,
        ],
        tabBarLabelStyle: isTablet ? styles.tabLabelTablet : styles.tabLabelPhone,
        tabBarItemStyle: isTablet ? styles.tabItemTablet : styles.tabItemPhone,
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="my-day"
        options={{
          title: t('tabs.myDay'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reading"
        options={{
          title: t('tabs.reading'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="menu-book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="math"
        options={{
          title: t('tabs.math'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calculate" color={color} />,
        }}
      />
      <Tabs.Screen
        name="drawings"
        options={{
          title: t('tabs.pictures'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="draw" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBase: {
    borderTopWidth: 1,
    borderTopColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.tabSurface,
    ...forestCampShadow,
  },
  tabBarPhone: {
    height: 78,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabBarTablet: {
    height: 92,
    paddingTop: 10,
    paddingBottom: 14,
  },
  tabBarIos: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    borderRadius: 30,
    overflow: 'hidden',
  },
  tabBarDefault: {
    position: 'relative',
  },
  tabLabelPhone: {
    ...forestCampTypography.heading,
    fontSize: 11,
    lineHeight: 14,
  },
  tabLabelTablet: {
    ...forestCampTypography.heading,
    fontSize: 13,
    lineHeight: 16,
  },
  tabItemPhone: {
    paddingVertical: 2,
  },
  tabItemTablet: {
    paddingVertical: 4,
  },
});
