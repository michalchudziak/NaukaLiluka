import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ColorPicker } from '@/components/ColorPicker';
import { ShapePicker, type ShapeType } from '@/components/ShapePicker';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { WordColors } from '@/constants/WordColors';
import type { DailyData } from '@/content/math/equation-scheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useEquationsStore } from '@/store/equations-store';
import { useSettingsStore } from '@/store/settings-store';

export default function EquationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const [selectedColor, setSelectedColor] = useState(WordColors[1].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const { completedSessions, getDailyData, markSessionCompleted } = useEquationsStore();
  const { math } = useSettingsStore();

  const dailyData: DailyData = getDailyData();

  const handleSessionPress = async (content: 'subitizing' | 'equations', sessionIndex: number) => {
    if (!dailyData) return;

    const token = `${content}${sessionIndex === 0 ? '1' : '2'}` as Parameters<
      typeof markSessionCompleted
    >[0];

    if (content === 'subitizing') {
      router.push({
        pathname: '/set-display',
        params: {
          numbers: JSON.stringify(
            [...new Array(math.numbers.numberCount)].map(() => Math.floor(Math.random() * 150))
          ),
          shape: selectedShape,
          color: selectedColor,
          showNumberFollowups: 'true',
        },
      });
    } else {
      router.push({
        pathname: '/equations-display',
        params: {
          pairs: JSON.stringify(dailyData.equations),
          color: selectedColor,
        },
      });
    }

    setTimeout(() => {
      markSessionCompleted(token);
    }, 1000);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}`;
    const sessionIndex = sessionNumber - 1;

    const isRoutineCompleted = (routine: 'subitizing' | 'equations', index: number) =>
      completedSessions.includes(`${routine}${index === 0 ? '1' : '2'}`);

    return (
      <View key={sessionKey} style={styles.sessionRow}>
        <ThemedText type="subtitle" style={styles.sessionLabel}>
          {t(`booksDaily.${sessionKey}`)}
        </ThemedText>
        <View style={styles.buttonsContainer}>
          {dailyData.sessionContent[sessionIndex].map((item) => (
            <StateActionRow
              key={`${item}`}
              title={t(`math.equations.${item}`)}
              subtitle={
                isRoutineCompleted(item, sessionIndex)
                  ? t('myDay.doneStatus')
                  : t('myDay.pendingStatus')
              }
              isCompleted={isRoutineCompleted(item, sessionIndex)}
              onPress={() => handleSessionPress(item, sessionIndex)}
            />
          ))}
        </View>
      </View>
    );
  };

  if (!dailyData) {
    return (
      <ThemedView
        style={[styles.container, styles.centerContent, { marginBottom: bottomTabBarHeight }]}
      >
        <ThemedText style={styles.noContentText}>{t('booksDaily.noContent')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            marginBottom: bottomTabBarHeight + 8,
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="subtitle" style={styles.dayTitle}>
          {t('math.equations.dayTitle', { day: dailyData.activeDay })}
        </ThemedText>

        <View style={styles.sessionsContainer}>
          {renderSession(1)}
          {renderSession(2)}
        </View>

        <ColorPicker
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          label={t('math.sets.selectColor')}
        />

        <ShapePicker
          selectedShape={selectedShape}
          onShapeSelect={setSelectedShape}
          label={t('math.sets.selectShape')}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    paddingTop: 14,
    paddingBottom: 32,
    gap: 14,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  sessionRow: {
    gap: 10,
    borderRadius: ForestCampTheme.radius.lg,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: 14,
    ...forestCampSoftShadow,
  },
  sessionLabel: {
    ...forestCampTypography.heading,
    fontSize: 20,
    lineHeight: 24,
    color: ForestCampTheme.colors.title,
  },
  buttonsContainer: {
    gap: 10,
  },
  dayTitle: {
    ...forestCampTypography.display,
    fontSize: 34,
    lineHeight: 38,
    color: ForestCampTheme.colors.title,
    textAlign: 'center',
    marginBottom: 10,
  },
  noContentText: {
    ...forestCampTypography.heading,
    fontSize: 18,
    color: ForestCampTheme.colors.textMuted,
    textAlign: 'center',
  },
});
