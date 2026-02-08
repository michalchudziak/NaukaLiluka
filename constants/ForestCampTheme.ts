import { Platform, type TextStyle, type ViewStyle } from 'react-native';

const displayFontFamily = Platform.select({
  ios: 'AvenirNext-Heavy',
  android: 'sans-serif-condensed',
  default: 'sans-serif',
});

const headingFontFamily = Platform.select({
  ios: 'AvenirNext-DemiBold',
  android: 'sans-serif-medium',
  default: 'sans-serif',
});

const bodyFontFamily = Platform.select({
  ios: 'AvenirNext-Regular',
  android: 'sans-serif',
  default: 'sans-serif',
});

export const ForestCampTheme = {
  breakpoints: {
    tablet: 768,
    wideTablet: 1024,
  },
  colors: {
    background: '#eef6e7',
    backgroundAlt: '#e2efd7',
    card: '#fffdf5',
    cardMuted: '#f5fbef',
    border: '#c5d9b5',
    borderStrong: '#8aa06f',
    text: '#1f3a29',
    textMuted: '#5b735f',
    title: '#15432d',
    primary: '#2f8653',
    primaryStrong: '#205f3b',
    success: '#7fbe5d',
    warning: '#e7b95a',
    danger: '#d85f4a',
    tabSurface: '#f8f6df',
  },
  radius: {
    xl: 30,
    lg: 22,
    md: 16,
    sm: 12,
  },
} as const;

export type ForestCampMetrics = {
  isTablet: boolean;
  isWideTablet: boolean;
  screenPadding: number;
  sectionGap: number;
  cardPadding: number;
  maxContentWidth: number;
};

export function getForestCampMetrics(width: number): ForestCampMetrics {
  const isTablet = width >= ForestCampTheme.breakpoints.tablet;
  const isWideTablet = width >= ForestCampTheme.breakpoints.wideTablet;

  return {
    isTablet,
    isWideTablet,
    screenPadding: isWideTablet ? 34 : isTablet ? 28 : 18,
    sectionGap: isTablet ? 20 : 14,
    cardPadding: isTablet ? 22 : 16,
    // Use full available width (minus outer screen padding) on all devices.
    maxContentWidth: width,
  };
}

export const forestCampTypography: Record<'display' | 'heading' | 'body' | 'mono', TextStyle> = {
  display: {
    fontFamily: displayFontFamily,
    letterSpacing: 0.45,
  },
  heading: {
    fontFamily: headingFontFamily,
    letterSpacing: 0.3,
  },
  body: {
    fontFamily: bodyFontFamily,
  },
  mono: {
    fontFamily: 'SpaceMono',
    letterSpacing: 0.2,
  },
};

export const forestCampShadow: ViewStyle = {
  shadowColor: '#385231',
  shadowOpacity: 0.2,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 5,
  },
  elevation: 8,
};

export const forestCampSoftShadow: ViewStyle = {
  shadowColor: '#385231',
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },
  elevation: 4,
};
