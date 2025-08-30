import { View, StyleSheet } from 'react-native';

interface HeartProps {
  size?: number;
  color?: string;
}

export function Heart({ size = 30, color = '#333' }: HeartProps) {
  const heartWidth = size * 0.53;
  const heartHeight = size * 0.67;
  const borderRadius = heartWidth / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.heartBefore,
          {
            width: heartWidth,
            height: heartHeight,
            backgroundColor: color,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            top: size * 0.2,
            left: size * 0.23,
          },
        ]}
      />
      <View
        style={[
          styles.heartAfter,
          {
            width: heartWidth,
            height: heartHeight,
            backgroundColor: color,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            top: size * 0.2,
            left: size * 0.23,
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
  heartBefore: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
  heartAfter: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
});