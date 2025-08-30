import { StyleSheet, View } from 'react-native';

interface PentagonProps {
  size?: number;
  color?: string;
}

export function Pentagon({ size = 30, color = '#333' }: PentagonProps) {
  const width = size;
  const topHeight = size * 0.38;
  const bottomHeight = size * 0.5;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.pentagonTop,
          {
            borderLeftWidth: width / 2,
            borderRightWidth: width / 2,
            borderBottomWidth: topHeight,
            borderBottomColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.pentagonBottom,
          {
            width: width,
            height: bottomHeight,
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
  pentagonTop: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pentagonBottom: {},
});
