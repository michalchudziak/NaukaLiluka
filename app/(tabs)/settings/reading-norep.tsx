import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
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
          <Ionicons
            name="remove"
            size={20}
            color={
              value <= min ? ForestCampTheme.colors.textMuted : ForestCampTheme.colors.primaryStrong
            }
          />
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

export default function ReadingNoRepSettingsScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { reading, updateReadingNoRepWords, updateReadingNoRepSentences, hydrate } =
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
            paddingBottom: tabBarHeight + 8,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
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
  input: {
    width: 54,
    height: 34,
    marginHorizontal: 10,
    textAlign: 'center',
    fontSize: 17,
    borderRadius: 10,
    backgroundColor: '#eff7e8',
    color: ForestCampTheme.colors.title,
    ...forestCampTypography.heading,
  },
  separator: {
    height: 1,
    backgroundColor: '#dbe8cf',
    marginLeft: 16,
  },
});
