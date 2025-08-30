import { StyleSheet, View } from 'react-native';

interface StarProps {
  size?: number;
  color?: string;
}

export function Star({ size = 30, color = '#333' }: StarProps) {
  const triangleSize = size / 3;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.starMain,
          {
            borderLeftWidth: triangleSize,
            borderRightWidth: triangleSize,
            borderBottomWidth: triangleSize * 0.7,
            borderBottomColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.starBefore,
          {
            borderLeftWidth: triangleSize,
            borderRightWidth: triangleSize,
            borderBottomWidth: triangleSize * 0.7,
            borderBottomColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.starAfter,
          {
            borderLeftWidth: triangleSize,
            borderRightWidth: triangleSize,
            borderBottomWidth: triangleSize * 0.7,
            borderBottomColor: color,
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
  starMain: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '35deg' }],
  },
  starBefore: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-35deg' }],
  },
  starAfter: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '108deg' }],
  },
});
