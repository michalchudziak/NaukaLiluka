import {
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function Button({ title, onPress, style, disabled = false }: ButtonProps) {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        metrics.isTablet && styles.buttonTablet,
        style,
        disabled && styles.buttonDisabled,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.buttonContent}>
        <ThemedText
          type="title"
          style={[
            styles.buttonText,
            metrics.isTablet && styles.buttonTextTablet,
            disabled && styles.buttonTextDisabled,
          ]}
        >
          {title}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.primaryStrong,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    minHeight: 94,
    maxHeight: 152,
    backgroundColor: ForestCampTheme.colors.primary,
    ...forestCampShadow,
  },
  buttonTablet: {
    minHeight: 112,
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  buttonDisabled: {
    backgroundColor: ForestCampTheme.colors.borderStrong,
    borderColor: ForestCampTheme.colors.borderStrong,
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...forestCampTypography.heading,
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
  },
  buttonTextTablet: {
    fontSize: 28,
    lineHeight: 34,
  },
  buttonTextDisabled: {
    color: '#eef3e8',
  },
  icon: {
    marginTop: 2,
  },
});
