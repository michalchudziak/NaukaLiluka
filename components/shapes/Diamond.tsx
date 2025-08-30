import { View, StyleSheet } from 'react-native';

interface DiamondProps {
  size?: number;
  color?: string;
}

export function Diamond({ size = 30, color = '#333' }: DiamondProps) {
  const diamondSize = size * 0.73;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.diamond,
          {
            width: diamondSize,
            height: diamondSize,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamond: {
    transform: [{ rotate: '45deg' }],
  },
});