import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ForestCampTheme, forestCampTypography, spacing } from '@/constants/ForestCampTheme';
import { parseNumberDraft } from '@/shared/numberInput';

interface NumberInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberInput({
  label,
  value,
  onChangeValue,
  min = 1,
  max = 100,
  step = 1,
  suffix,
}: NumberInputProps) {
  const { width, fontScale } = useWindowDimensions();
  const [draft, setDraft] = useState<string | null>(null);
  const commitDraft = () => {
    const next = draft === null ? null : parseNumberDraft(draft, min, max);
    if (next !== null && next !== value) onChangeValue(next);
    setDraft(null);
  };
  const stepValue = draft === null ? value : (parseNumberDraft(draft, min, max) ?? value);
  const handleDecrement = () => {
    setDraft(null);
    if (stepValue > min) onChangeValue(Math.max(min, stepValue - step));
  };

  const handleIncrement = () => {
    setDraft(null);
    if (stepValue < max) onChangeValue(Math.min(max, stepValue + step));
  };

  const inputWidth = Math.max(62, String(max).length * 12 * fontScale + spacing.lg);
  const controlSize = Math.max(34, 30 * fontScale);
  const stacked = fontScale > 1.4 || width < 400;

  return (
    <View style={[styles.container, stacked && styles.containerStacked]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            { minWidth: controlSize, minHeight: controlSize },
            stepValue <= min && styles.buttonDisabled,
          ]}
          onPress={handleDecrement}
          disabled={stepValue <= min}
          accessibilityLabel={`${label}: −`}
        >
          <Ionicons
            name="remove"
            size={20}
            color={
              stepValue <= min
                ? ForestCampTheme.colors.textMuted
                : ForestCampTheme.colors.primaryStrong
            }
          />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { width: inputWidth, minHeight: controlSize }]}
            value={draft ?? value.toString()}
            onChangeText={setDraft}
            onBlur={commitDraft}
            onSubmitEditing={commitDraft}
            accessibilityLabel={label}
            keyboardType="number-pad"
            selectTextOnFocus
          />
          {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { minWidth: controlSize, minHeight: controlSize },
            stepValue >= max && styles.buttonDisabled,
          ]}
          onPress={handleIncrement}
          disabled={stepValue >= max}
          accessibilityLabel={`${label}: +`}
        >
          <Ionicons
            name="add"
            size={20}
            color={
              stepValue >= max
                ? ForestCampTheme.colors.textMuted
                : ForestCampTheme.colors.primaryStrong
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: ForestCampTheme.colors.card,
  },
  containerStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  label: {
    ...forestCampTypography.heading,
    fontSize: 16,
    color: ForestCampTheme.colors.title,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    minWidth: 34,
    minHeight: 34,
    borderRadius: 10,
    backgroundColor: ForestCampTheme.colors.cardMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  input: {
    width: 62,
    minHeight: 34,
    textAlign: 'center',
    fontSize: 17,
    borderRadius: 10,
    backgroundColor: '#eff7e8',
    color: ForestCampTheme.colors.title,
    ...forestCampTypography.heading,
  },
  suffix: {
    ...forestCampTypography.body,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
    marginLeft: spacing.xs,
  },
});
