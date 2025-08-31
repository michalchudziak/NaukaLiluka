import type React from 'react';
import { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, type TextProps, View } from 'react-native';

interface AutoSizeTextProps extends Omit<TextProps, 'style'> {
  children: React.ReactNode;
  color?: string;
  style?: any;
  maxLength?: number;
}

const getFontSizeForText = (_text: string, screenWidth: number): number => {
  if (screenWidth < 448) {
    return 80;
  } else if (screenWidth > 448 && screenWidth < 768) {
    return 100;
  } else if (screenWidth > 768 && screenWidth < 1024) {
    return 120;
  } else if (screenWidth > 1024 && screenWidth < 1280) {
    return 140;
  } else if (screenWidth > 1280 && screenWidth < 1536) {
    return 160;
  } else if (screenWidth > 1536 && screenWidth < 1920) {
    return 180;
  } else if (screenWidth > 1920 && screenWidth < 2560) {
    return 200;
  } else {
    return 220;
  }
};

export const AutoSizeText: React.FC<AutoSizeTextProps> = ({
  children,
  color = '#000000',
  style,
  maxLength,
  ...textProps
}) => {
  const { width: screenWidth } = Dimensions.get('window');

  const fontSize = useMemo(() => {
    const childLength = typeof children === 'string' ? children.length : 0;
    const lengthToUse = maxLength ? Math.max(childLength, maxLength) : childLength;
    return getFontSizeForText('x'.repeat(lengthToUse), screenWidth);
  }, [maxLength, screenWidth, children]);

  return (
    <View style={styles.container}>
      <Text
        {...textProps}
        style={[styles.text, { fontSize, color }, style]}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.5}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
