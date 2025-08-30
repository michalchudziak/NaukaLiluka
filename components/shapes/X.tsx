import { StyleSheet, View } from 'react-native';

interface XProps {
  size?: number;
  color?: string;
}

export function X({ size = 30, color = '#333' }: XProps) {
  const lineWidth = size / 7.5;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.line1,
          {
            width: size,
            height: lineWidth,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.line2,
          {
            width: size,
            height: lineWidth,
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
  line1: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  line2: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
});
