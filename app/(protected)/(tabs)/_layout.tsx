import { Tabs } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { ThemedTitle } from '@/components/ThemedTitle';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  ForestCampTheme,
  forestCampShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

const MAX_TAB_BAR_WIDTH = 600;

export default function TabLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const isTablet = metrics.isTablet;

  const tabBarInset = isTablet ? Math.max(spacing.xl, (width - MAX_TAB_BAR_WIDTH) / 2) : spacing.xl;

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
        headerShadowVisible: false,
        headerStyle: { backgroundColor: ForestCampTheme.colors.background },
<<<<<<< ours
        headerTitleAlign: 'center',
        headerTintColor: ForestCampTheme.colors.primaryStrong,
        headerTitle: ({ children }) => <ThemedTitle>{children}</ThemedTitle>,
=======
        headerTitleAlign: 'left',
        headerTintColor: ForestCampTheme.colors.primaryStrong,
        headerTitleStyle: {
          ...forestCampTypography.display,
          fontSize: isTablet ? 36 : 30,
          color: ForestCampTheme.colors.title,
        },
>>>>>>> theirs
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBarBase,
          isTablet ? styles.tabBarTablet : styles.tabBarPhone,
          {
            position: 'absolute' as const,
            left: tabBarInset,
            right: tabBarInset,
            bottom: 10,
            borderRadius: 30,
            overflow: 'hidden' as const,
          },
        ],
        tabBarLabelStyle: isTablet ? styles.tabLabelTablet : styles.tabLabelPhone,
        tabBarItemStyle: isTablet ? styles.tabItemTablet : styles.tabItemPhone,
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="my-day"
        options={{
          headerShown: true,
<<<<<<< ours
          title: t('tabs.myDay'),
=======
          headerTitle: t('myDay.title'),
          tabBarLabel: t('tabs.myDay'),
>>>>>>> theirs
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
          headerShown: true,
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
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
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
<<<<<<< ours
=======
  tabBarIos: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: 10,
    borderRadius: 30,
    overflow: 'hidden',
  },
  tabBarDefault: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: 10,
    borderRadius: 30,
    overflow: 'hidden',
  },
>>>>>>> theirs
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
