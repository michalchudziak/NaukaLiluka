import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settings-store';

interface NumberInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

function NumberInput({
  label,
  value,
  onChangeValue,
  min = 100,
  max = 10000,
  step = 100,
  suffix = 'ms',
}: NumberInputProps) {
  const handleDecrement = () => {
    if (value > min) onChangeValue(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    if (value < max) onChangeValue(Math.min(max, value + step));
  };

  const handleTextChange = (text: string) => {
    const num = parseInt(text, 10) || min;
    if (num >= min && num <= max) onChangeValue(num);
  };

  return (
    <View style={styles.inputContainer}>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <View style={styles.inputControls}>
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={value <= min ? '#C7C7CC' : '#007AFF'} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={value.toString()}
            onChangeText={handleTextChange}
            keyboardType="number-pad"
            selectTextOnFocus
          />
          <Text style={styles.suffix}>{suffix}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={handleIncrement}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={value >= max ? '#C7C7CC' : '#007AFF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CountInput({
  label,
  value,
  onChangeValue,
  min = 1,
  max = 50,
}: {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const handleDecrement = () => {
    if (value > min) onChangeValue(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChangeValue(value + 1);
  };

  const handleTextChange = (text: string) => {
    const num = parseInt(text, 10) || min;
    if (num >= min && num <= max) onChangeValue(num);
  };

  return (
    <View style={styles.inputContainer}>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <View style={styles.inputControls}>
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={value <= min ? '#C7C7CC' : '#007AFF'} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={value.toString()}
          onChangeText={handleTextChange}
          keyboardType="number-pad"
          selectTextOnFocus
        />

        <TouchableOpacity
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={handleIncrement}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={value >= max ? '#C7C7CC' : '#007AFF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MathSettingsScreen() {
  const { t } = useTranslation();
  const {
    math,
    updateMathEquationsInterval,
    updateMathEquationsCount,
    updateMathNumbersInterval,
    updateMathNumbersCount,
    hydrate,
  } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionDescription}>{t('settings.math.description')}</ThemedText>

          <View style={styles.settingsContent}>
            <NumberInput
              label={t('settings.math.numbersInterval')}
              value={math.numbers.interval}
              onChangeValue={updateMathNumbersInterval}
              min={200}
              max={5000}
              step={100}
              suffix="ms"
            />

            <View style={styles.separator} />

            <CountInput
              label={t('settings.math.numbersCount')}
              value={math.numbers.numberCount}
              onChangeValue={updateMathNumbersCount}
              min={1}
              max={50}
            />

            <View style={styles.separator} />

            <NumberInput
              label={t('settings.math.equationsInterval')}
              value={math.equations.interval}
              onChangeValue={updateMathEquationsInterval}
              min={500}
              max={5000}
              step={100}
              suffix="ms"
            />

            <View style={styles.separator} />

            <CountInput
              label={t('settings.math.equationsCount')}
              value={math.equations.equationCount}
              onChangeValue={updateMathEquationsCount}
              min={1}
              max={50}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  section: { marginTop: 30 },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  settingsContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#C8C7CC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  inputLabel: { fontSize: 16, flex: 1 },
  inputControls: { flexDirection: 'row', alignItems: 'center' },
  button: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  input: {
    width: 60,
    height: 32,
    textAlign: 'center',
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    paddingRight: 2,
  },
  suffix: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  separator: { height: 0.5, backgroundColor: '#C8C7CC', marginLeft: 20 },
});

