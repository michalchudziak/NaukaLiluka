import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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
}

function NumberInput({ label, value, onChangeValue, min = 1, max = 99 }: NumberInputProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChangeValue(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChangeValue(value + 1);
    }
  };

  const handleTextChange = (text: string) => {
    const num = parseInt(text, 10) || min;
    if (num >= min && num <= max) {
      onChangeValue(num);
    }
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

export default function ReadingNoRepSettingsScreen() {
  const { t } = useTranslation();
  const { reading, updateReadingNoRepWords, updateReadingNoRepSentences, hydrate } =
    useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.reading.noRepDescription')}
          </ThemedText>

          <View style={styles.settingsContent}>
            <NumberInput
              label={t('settings.reading.wordsPerSession')}
              value={reading.noRep.words}
              onChangeValue={updateReadingNoRepWords}
              min={1}
              max={10}
            />

            <View style={styles.separator} />

            <NumberInput
              label={t('settings.reading.sentencesPerSession')}
              value={reading.noRep.sentences}
              onChangeValue={updateReadingNoRepSentences}
              min={1}
              max={10}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 30,
  },
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
  inputLabel: {
    fontSize: 16,
    flex: 1,
  },
  inputControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  input: {
    width: 50,
    height: 32,
    marginHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#C8C7CC',
    marginLeft: 20,
  },
});
