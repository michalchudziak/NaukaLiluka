import { StyleSheet, View } from 'react-native';

interface TriangleProps {
  size?: number;
  color?: string;
}

export function Triangle({ size = 30, color = '#333' }: TriangleProps) {
  const borderWidth = size / 2;
  const borderBottomWidth = size * 0.866; // height = width * sqrt(3)/2

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.triangle,
          {
            borderLeftWidth: borderWidth,
            borderRightWidth: borderWidth,
            borderBottomWidth: borderBottomWidth,
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
  triangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
