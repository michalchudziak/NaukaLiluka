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
import { useTranslation } from '@/hooks/useTranslation';

type SessionContent = {
  type: 'subitizing' | 'numbers';
  isOrdered: boolean;
};

type DailyData = {
  activeDay: number;
  numbers: number[];
  sessionContent: SessionContent[][];
};

export default function SetsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');

  const dailyData: DailyData = {
    activeDay: 1,
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    sessionContent: [
      [
        { type: 'subitizing', isOrdered: true },
        { type: 'numbers', isOrdered: true },
      ],
      [{ type: 'subitizing', isOrdered: false }],
    ],
  };

  const handleSessionPress = (sessionContent: SessionContent) => {
    if (!dailyData) return;

    const numbers = sessionContent.isOrdered
      ? dailyData.numbers
      : dailyData.numbers.sort(() => Math.random() - 0.5);

    if (sessionContent.type === 'subitizing') {
      router.push({
        pathname: '/set-display',
        params: {
          numbers: JSON.stringify(numbers),
          shape: selectedShape,
          color: selectedColor,
        },
      });
    } else {
      router.push({
        pathname: '/display',
        params: {
          items: JSON.stringify(numbers.map((n) => n.toString())),
          type: 'words',
          color: selectedColor,
        },
      });
    }
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}`;

    return (
      <View key={sessionKey} style={styles.sessionRow}>
        <ThemedText type="subtitle" style={styles.sessionLabel}>
          {t(`booksDaily.${sessionKey}`)}
        </ThemedText>
        <View style={styles.buttonsContainer}>
          {dailyData.sessionContent[sessionNumber - 1].map((item) => (
            <TrackButton
              key={`${item.type}-${item.isOrdered}`}
              title={t(item.type)}
              isCompleted={false}
              onPress={() => handleSessionPress(item)}
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
          {t('math.sets.dayTitle', { day: dailyData.activeDay })}
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
