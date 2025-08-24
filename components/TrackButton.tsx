import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface TrackButtonProps {
  title: string;
  isCompleted?: boolean;
  onPress?: () => void;
}

export function TrackButton({ title, isCompleted = false, onPress }: TrackButtonProps) {
  const colorScheme = useColorScheme();
  const buttonColor = isCompleted 
    ? '#9CA3AF' 
    : Colors[colorScheme ?? 'light'].tint;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonColor }
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        <ThemedText type="title" style={styles.buttonText}>
          {title} {isCompleted ? '✅' : '⏳'}
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