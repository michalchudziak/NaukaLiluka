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
import type { SessionContent } from '@/content/math/learning-scheme';
import { type MathSession, useCompleteMathSession, useMathStatus } from '@/hooks/useMath';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settings-store';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const guideImage = require('@/assets/images/guides/math.png');

export default function SetsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const { currentDay, dailyData, isSessionCompletedToday } = useMathStatus();
  const completeSession = useCompleteMathSession();
  const { math } = useSettingsStore();

  const handleSessionPress = async (sessionContent: SessionContent) => {
    const numbers = sessionContent.isOrdered
      ? dailyData.numbers
      : [...dailyData.numbers].sort(() => Math.random() - 0.5);

    const sessionType = `${sessionContent.type}${
      sessionContent.isOrdered ? 'Ordered' : 'Unordered'
    }` as MathSession;

    if (sessionContent.type === 'subitizing') {
      router.push({
        pathname: '/set-display',
        params: {
          numbers: JSON.stringify(numbers),
          shape: selectedShape,
          color: selectedColor,
          sessionType,
        },
      });
    } else {
      router.push({
        pathname: '/display',
        params: {
          items: JSON.stringify(numbers.map((n) => n.toString())),
          type: 'words',
          color: selectedColor,
          interval: String(math.numbers.interval),
          sessionType,
        },
      });
    }

    setTimeout(() => {
      void completeSession(sessionType);
    }, 1000);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}`;
    const sessionIndex = sessionNumber - 1;

    if (!dailyData?.sessionContent[sessionIndex]) {
      return null;
    }

    return (
      <View key={sessionKey} style={styles.sessionRow}>
        <ThemedText type="subtitle" style={styles.sessionLabel}>
          {t(`booksDaily.${sessionKey}`)}
        </ThemedText>
        <View style={styles.buttonsContainer}>
          {dailyData.sessionContent[sessionIndex].map((item) => {
            const isCompleted = isSessionCompletedToday(sessionKey as 'session1' | 'session2');
            const title =
              t(`math.sets.${item.type}`) +
              ' - ' +
              t(`math.sets.${item.isOrdered ? 'ordered' : 'unordered'}`);

            return (
              <StateActionRow
                key={`${item.type}-${item.isOrdered}`}
                title={title}
                subtitle={isCompleted ? t('myDay.doneStatus') : t('myDay.pendingStatus')}
                isCompleted={isCompleted}
                onPress={() => handleSessionPress(item)}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('math.sets.dayTitle', { day: currentDay }) }} />
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
          title={t('math.sets.guideTitle')}
          body={t('math.sets.guideBody')}
        />

        <View style={[styles.sessionsContainer, { maxWidth: metrics.maxContentWidth }]}>
          {renderSession(1)}
          {dailyData.sessionContent.length > 1 && renderSession(2)}
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
