import { View, StyleSheet } from 'react-native';

interface PlusProps {
  size?: number;
  color?: string;
}

export function Plus({ size = 30, color = '#333' }: PlusProps) {
  const lineWidth = size / 7.5;
  const lineLength = size * 0.87;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.vertical,
          {
            width: lineWidth,
            height: lineLength,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.horizontal,
          {
            width: lineLength,
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
  vertical: {
    position: 'absolute',
  },
  horizontal: {
    position: 'absolute',
  },
});