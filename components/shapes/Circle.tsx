import { StyleSheet, View } from 'react-native';

interface CircleProps {
  size?: number;
  color?: string;
}

export function Circle({ size = 30, color = '#333' }: CircleProps) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  circle: {},
});
