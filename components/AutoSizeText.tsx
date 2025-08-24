import React, { useMemo } from 'react';
import { Text, View, StyleSheet, Dimensions, TextProps } from 'react-native';

interface AutoSizeTextProps extends Omit<TextProps, 'style'> {
  children: string;
  color?: string;
  style?: any;
  maxLength?: number;
}

const getFontSizeForText = (text: string, screenWidth: number): number => {
  const length = text.length;
  const baseWidth = screenWidth * 0.8;
  
  if (length <= 5) {
    return Math.min(120, baseWidth / 3);
  } else if (length <= 10) {
    return Math.min(90, baseWidth / 5);
  } else if (length <= 15) {
    return Math.min(70, baseWidth / 7);
  } else if (length <= 25) {
    return Math.min(50, baseWidth / 10);
  } else if (length <= 40) {
    return Math.min(36, baseWidth / 15);
  } else if (length <= 60) {
    return Math.min(28, baseWidth / 20);
  } else if (length <= 80) {
    return Math.min(22, baseWidth / 25);
  } else if (length <= 100) {
    return Math.min(18, baseWidth / 30);
  } else {
    return Math.min(14, baseWidth / 40);
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
    const lengthToUse = maxLength ? Math.max(children.length, maxLength) : children.length;
    return getFontSizeForText('x'.repeat(lengthToUse), screenWidth);
  }, [children.length, maxLength, screenWidth]);

  return (
    <View style={styles.container}>
      <Text
        {...textProps}
        style={[
          styles.text,
          { fontSize, color },
          style,
        ]}
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