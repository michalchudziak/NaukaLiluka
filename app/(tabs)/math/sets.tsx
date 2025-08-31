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
import type { SessionContent } from '@/content/math/learning-scheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useMathStore } from '@/store/math-store';
import { useSettingsStore } from '@/store/settings-store';

export default function SetsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const { getDailyData, markSessionCompleted, isSessionCompletedToday } = useMathStore();
  const { math } = useSettingsStore();

  const dailyData = getDailyData();

  const handleSessionPress = async (sessionContent: SessionContent) => {
    if (!dailyData) return;

    const numbers = sessionContent.isOrdered
      ? dailyData.numbers
      : [...dailyData.numbers].sort(() => Math.random() - 0.5);

    // Map session content to the session type for tracking
    const sessionType =
      `${sessionContent.type}${sessionContent.isOrdered ? 'Ordered' : 'Unordered'}` as Parameters<
        typeof markSessionCompleted
      >[0];

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
      markSessionCompleted(sessionType);
    }, 1000);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}`;
    const sessionIndex = sessionNumber - 1;

    if (!dailyData.sessionContent[sessionIndex]) {
      return null;
    }

    return (
      <View key={sessionKey} style={styles.sessionRow}>
        <ThemedText type="subtitle" style={styles.sessionLabel}>
          {t(`booksDaily.${sessionKey}`)}
        </ThemedText>
        <View style={styles.buttonsContainer}>
          {dailyData.sessionContent[sessionIndex].map((item) => {
            // Check if this specific content is completed
            const isCompleted = isSessionCompletedToday(sessionKey as 'session1' | 'session2');

            return (
              <TrackButton
                key={`${item.type}-${item.isOrdered}`}
                title={
                  t(`math.sets.${item.type}`) +
                  ' - ' +
                  t(`math.sets.${item.isOrdered ? 'ordered' : 'unordered'}`)
                }
                isCompleted={isCompleted}
                onPress={() => handleSessionPress(item)}
              />
            );
          })}
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
          {t('math.sets.dayTitle', { day: dailyData.activeDay })}
        </ThemedText>

        <View style={styles.sessionsContainer}>
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
