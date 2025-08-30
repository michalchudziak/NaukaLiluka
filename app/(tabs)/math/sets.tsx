import { ColorPicker } from '@/components/ColorPicker';
import { ShapePicker, ShapeType } from '@/components/ShapePicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { WordColors } from '@/constants/WordColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useMathStore } from '@/store/math-store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function SetsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  
  const { 
    getDailyData, 
    markSessionCompleted, 
    isSessionCompletedToday,
    getNumbersForDisplay 
  } = useMathStore();
  
  const dailyData = getDailyData();

  const handleSessionPress = (sessionId: 'session1' | 'session2') => {
    if (!dailyData) return;
    
    // Session 1 is always ordered, Session 2 is always unordered
    const type = sessionId === 'session1' ? 'ordered' : 'unordered';
    const numbers = getNumbersForDisplay(type);
    
    router.push({
      pathname: '/set-display',
      params: {
        numbers: JSON.stringify(numbers),
        shape: selectedShape,
        color: selectedColor,
      },
    });
    
    // Mark as completed
    markSessionCompleted(sessionId);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}` as 'session1' | 'session2';
    const isSession1 = sessionNumber === 1;
    
    return (
      <View key={sessionKey} style={styles.sessionRow}>
        <ThemedText type="subtitle" style={styles.sessionLabel}>
          {t(`booksDaily.${sessionKey}`)}
        </ThemedText>
        <TrackButton 
          title={t(isSession1 ? 'math.sets.ordered' : 'math.sets.unordered')}
          isCompleted={isSessionCompletedToday(sessionKey)}
          onPress={() => handleSessionPress(sessionKey)}
        />
      </View>
    );
  };

  if (!dailyData) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, { marginBottom: bottomTabBarHeight }]}>
        <ThemedText style={styles.noContentText}>{t('booksDaily.noContent')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { marginBottom: bottomTabBarHeight }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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