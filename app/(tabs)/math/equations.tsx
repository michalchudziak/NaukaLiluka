import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ColorPicker } from '@/components/ColorPicker';
import { ShapePicker, type ShapeType } from '@/components/ShapePicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { WordColors } from '@/constants/WordColors';
import type { DailyData } from '@/content/math/equation-scheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useEquationsStore } from '@/store/equations-store';

export default function EquationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const { completedSessions, getDailyData, markSessionCompleted, isSessionCompletedToday } =
    useEquationsStore();

  // Keep local reference to data for rendering
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
          numbers: JSON.stringify([...new Array(10)].map(() => Math.floor(Math.random() * 150))),
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
          sessionType: token,
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
            <TrackButton
              key={`${item}`}
              title={t(`math.equations.${item}`)}
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
    <ThemedView style={[styles.container, { marginBottom: bottomTabBarHeight }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 30,
  },
  sessionRow: {
    gap: 15,
  },
  sessionLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  buttonsContainer: {
    gap: 10,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  noContentText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
