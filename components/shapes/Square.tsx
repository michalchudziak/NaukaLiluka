import { View, StyleSheet } from 'react-native';

interface SquareProps {
  size?: number;
  color?: string;
}

export function Square({ size = 30, color = '#333' }: SquareProps) {
  return (
    <View
      style={[
        styles.square,
        {
          width: size,
          height: size,
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  square: {},
});