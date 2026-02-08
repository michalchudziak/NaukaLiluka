import { Tabs } from 'expo-router';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';

export default function TabLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <Tabs
      initialRouteName="my-day"
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBarBase,
          isTablet ? styles.tabBarTablet : styles.tabBarPhone,
          Platform.select({
            ios: styles.tabBarIos,
            default: styles.tabBarDefault,
          }),
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
      <Tabs.Screen
        name="style-lab"
        options={{
          title: t('tabs.styleLab'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="color-lens" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBase: {
    borderTopWidth: 0,
    backgroundColor: '#ffffff',
    shadowColor: '#332f5f',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    elevation: 14,
  },
  tabBarPhone: {
    height: 76,
    paddingTop: 6,
    paddingBottom: 10,
  },
  tabBarTablet: {
    height: 88,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabBarIos: {
    position: 'absolute',
  },
  tabBarDefault: {
    position: 'relative',
  },
  tabLabelPhone: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabLabelTablet: {
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  tabItemPhone: {
    paddingVertical: 2,
  },
  tabItemTablet: {
    paddingVertical: 4,
  },
});
