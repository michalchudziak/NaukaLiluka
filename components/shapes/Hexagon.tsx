import { View, StyleSheet } from 'react-native';

interface HexagonProps {
  size?: number;
  color?: string;
}

export function Hexagon({ size = 30, color = '#333' }: HexagonProps) {
  const width = size * 0.53;
  const mainHeight = size * 0.33;
  const triangleWidth = width / 2;
  const triangleHeight = size * 0.23;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.hexagonBefore,
          {
            borderLeftWidth: triangleWidth,
            borderRightWidth: triangleWidth,
            borderBottomWidth: triangleHeight,
            borderBottomColor: color,
            top: -triangleHeight,
          },
        ]}
      />
      <View
        style={[
          styles.hexagonMain,
          {
            width: width,
            height: mainHeight,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.hexagonAfter,
          {
            borderLeftWidth: triangleWidth,
            borderRightWidth: triangleWidth,
            borderTopWidth: triangleHeight,
            borderTopColor: color,
            bottom: -triangleHeight,
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
  hexagonBefore: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  hexagonMain: {},
  hexagonAfter: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});