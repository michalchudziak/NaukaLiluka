import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
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
    if (value > min) {
      onChangeValue(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChangeValue(Math.min(max, value + step));
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
          <Ionicons
            name="remove"
            size={20}
            color={
              value <= min ? ForestCampTheme.colors.textMuted : ForestCampTheme.colors.primaryStrong
            }
          />
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
          <Ionicons
            name="add"
            size={20}
            color={
              value >= max ? ForestCampTheme.colors.textMuted : ForestCampTheme.colors.primaryStrong
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ReadingIntervalSettingsScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { reading, updateReadingIntervalWords, updateReadingIntervalSentences, hydrate } =
    useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.reading.intervalDescription')}
          </ThemedText>

          <View style={styles.settingsContent}>
            <NumberInput
              label={t('settings.reading.wordsInterval')}
              value={reading.interval.words}
              onChangeValue={updateReadingIntervalWords}
              min={500}
              max={5000}
              step={100}
              suffix="ms"
            />

            <View style={styles.separator} />

            <NumberInput
              label={t('settings.reading.sentencesInterval')}
              value={reading.interval.sentences}
              onChangeValue={updateReadingIntervalSentences}
              min={500}
              max={5000}
              step={100}
              suffix="ms"
            />
          </View>

          <ThemedText style={styles.hint}>{t('settings.reading.intervalHint')}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 14,
    paddingBottom: 20,
  },
  section: {
    marginTop: 10,
  },
  sectionDescription: {
    ...forestCampTypography.body,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
    marginHorizontal: 10,
    marginBottom: 14,
    lineHeight: 20,
  },
  settingsContent: {
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    borderRadius: ForestCampTheme.radius.lg,
    overflow: 'hidden',
    ...forestCampSoftShadow,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ForestCampTheme.colors.card,
  },
  inputLabel: {
    ...forestCampTypography.heading,
    fontSize: 16,
    color: ForestCampTheme.colors.title,
    flex: 1,
  },
  inputControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 34,
    height: 34,
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
    marginHorizontal: 10,
  },
  input: {
    width: 62,
    height: 34,
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
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#dbe8cf',
    marginLeft: 16,
  },
  hint: {
    ...forestCampTypography.body,
    fontSize: 13,
    color: ForestCampTheme.colors.textMuted,
    marginHorizontal: 10,
    marginTop: 14,
    lineHeight: 18,
  },
});
