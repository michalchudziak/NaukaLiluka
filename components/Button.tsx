import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, style }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        <ThemedText type="title" style={styles.buttonText}>
          {title}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: Colors.light.tint,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  icon: {
    marginTop: 2,
  },
});