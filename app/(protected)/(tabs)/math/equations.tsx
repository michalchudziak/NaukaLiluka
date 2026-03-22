import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ColorPicker } from '@/components/ColorPicker';
import { GuideCard } from '@/components/GuideCard';
import { ShapePicker, type ShapeType } from '@/components/ShapePicker';
import { StateActionRow } from '@/components/StateActionRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { WordColors } from '@/constants/WordColors';
import {
  type EquationSession,
  useCompleteEquationSession,
  useEquationsStatus,
} from '@/hooks/useMath';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settings-store';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const guideImage = require('@/assets/images/guides/math.png');

export default function EquationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const [selectedColor, setSelectedColor] = useState(WordColors[1].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const { currentDay, completedSessionsToday, dailyData } = useEquationsStatus();
  const completeSession = useCompleteEquationSession();
  const { math } = useSettingsStore();

  const handleSessionPress = async (content: 'subitizing' | 'equations', sessionIndex: number) => {
    const token = `${content}${sessionIndex === 0 ? '1' : '2'}` as EquationSession;

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
      void completeSession(token);
    }, 1000);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}`;
    const sessionIndex = sessionNumber - 1;

    const isRoutineCompleted = (routine: 'subitizing' | 'equations', index: number) =>
      completedSessionsToday.includes(`${routine}${index === 0 ? '1' : '2'}` as EquationSession);

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

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('math.equations.dayTitle', { day: currentDay }) }} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: bottomTabBarHeight + spacing.lg,
            paddingHorizontal: metrics.screenPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GuideCard
          image={guideImage}
          title={t('math.equations.guideTitle')}
          body={t('math.equations.guideBody')}
        />

        <View style={[styles.sessionsContainer, { maxWidth: metrics.maxContentWidth }]}>
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
    width: '100%',
    alignSelf: 'center',
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  sessionsContainer: {
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
  },
  sessionRow: {
    gap: spacing.sm,
    borderRadius: ForestCampTheme.radius.lg,
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: spacing.lg,
    ...forestCampSoftShadow,
  },
  sessionLabel: {
    ...forestCampTypography.heading,
    fontSize: 20,
    lineHeight: 24,
    color: ForestCampTheme.colors.title,
  },
  buttonsContainer: {
    gap: spacing.sm,
  },
});
