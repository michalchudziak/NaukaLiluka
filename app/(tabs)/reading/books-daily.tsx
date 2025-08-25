import { ColorPicker } from '@/components/ColorPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { WordColors } from '@/constants/WordColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function BooksDailyScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const handleTrackPress = (sessionId: string, type: 'words' | 'sentences') => {
    const itemId = `${sessionId}-${type}`;
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}` as 'session1' | 'session2' | 'session3';
    const sessionId = sessionKey;

    return (
      <View key={sessionId} style={styles.sessionRow}>
        <ThemedText type="subtitle" style={styles.sessionLabel}>
          {t(`booksDaily.${sessionKey}`)}
        </ThemedText>
        <View style={styles.buttonsContainer}>
          <TrackButton
            title={t('booksDaily.words')}
            isCompleted={completedItems[`${sessionId}-words`]}
            onPress={() => handleTrackPress(sessionId, 'words')}
          />
          <View style={styles.buttonSpacer} />
          <TrackButton
            title={t('booksDaily.sentences')}
            isCompleted={completedItems[`${sessionId}-sentences`]}
            onPress={() => handleTrackPress(sessionId, 'sentences')}
          />
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sessionsContainer}>
          {renderSession(1)}
          {renderSession(2)}
          {renderSession(3)}
        </View>

        <ColorPicker
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          label={t('booksDaily.selectColor')}
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
    flexDirection: 'row',
    gap: 12,
  },
  buttonSpacer: {
    width: 12,
  },
});