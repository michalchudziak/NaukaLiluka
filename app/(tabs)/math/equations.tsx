import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
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
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const { getDailyData, markSessionCompleted, isSessionCompletedToday } = useEquationsStore();

  // Keep local reference to data for rendering
  const dailyData: DailyData = getDailyData();

  console.log(dailyData);

  const handleSessionPress = async (content: 'subitizing' | 'equations', sessionIndex: number) => {
    if (!dailyData) return;

    const token = `${content}${sessionIndex === 0 ? '1' : '2'}` as Parameters<
      typeof markSessionCompleted
    >[0];

    // Navigation placeholder for future implementation
    // if (content === 'subitizing') {
    //   // TODO: Navigate to subitizing view for equations (e.g., sets-based visualization)
    //   // router.push({ pathname: '/equations-subitizing', params: { ... } });
    // } else {
    //   // TODO: Navigate to equations display screen showing left/right sides
    //   // router.push({ pathname: '/equations-display', params: { ... } });
    // }

    setTimeout(() => {
      markSessionCompleted(token);
    }, 1000);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}`;
    const sessionIndex = sessionNumber - 1;

    const isCompleted = isSessionCompletedToday(sessionKey as 'session1' | 'session2');

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
              isCompleted={isCompleted}
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
