import { ColorPicker } from '@/components/ColorPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TrackButton } from '@/components/TrackButton';
import { WordColors } from '@/constants/WordColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

export default function BooksDailyScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(WordColors[0].hex);
  const [isLoading, setIsLoading] = useState(true);
  
  const { dailyPlan, getDailyContent, markSessionItemCompleted, hydrate } = useBookStore();

  useEffect(() => {
    const initializeDaily = async () => {
      setIsLoading(true);
      await hydrate();
      await getDailyContent();
      setIsLoading(false);
    };
    
    initializeDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrackPress = (
    sessionId: 'session1' | 'session2' | 'session3', 
    type: 'words' | 'sentences'
  ) => {
    if (!dailyPlan) return;
    
    const sessionContent = dailyPlan.sessions[sessionId];
    const items = type === 'words' ? sessionContent.words : sessionContent.sentences;
    
    // Navigate to display screen with the content
    router.push({
      pathname: '/display',
      params: {
        items: JSON.stringify(items),
        type: type,
        color: selectedColor,
      },
    });
    
    // Mark as completed
    markSessionItemCompleted(sessionId, type);
  };

  const renderSession = (sessionNumber: number) => {
    const sessionKey = `session${sessionNumber}` as 'session1' | 'session2' | 'session3';
    const sessionData = dailyPlan?.sessions[sessionKey];
    
    const hasWords = sessionData?.words && sessionData.words.length > 0;
    const hasSentences = sessionData?.sentences && sessionData.sentences.length > 0;

    return (
      <View key={sessionKey} style={styles.sessionRow}>
        <ThemedText type="subtitle" style={styles.sessionLabel}>
          {t(`booksDaily.${sessionKey}`)}
        </ThemedText>
        <View style={[styles.buttonsContainer, (!hasWords || !hasSentences) && styles.singleButtonContainer]}>
          {hasWords && (
            <TrackButton
              title={t('booksDaily.words')}
              isCompleted={sessionData?.isWordsCompleted || false}
              onPress={() => handleTrackPress(sessionKey, 'words')}
            />
          )}
          {hasWords && hasSentences && <View style={styles.buttonSpacer} />}
          {hasSentences && (
            <TrackButton
              title={t('booksDaily.sentences')}
              isCompleted={sessionData?.isSentencesCompleted || false}
              onPress={() => handleTrackPress(sessionKey, 'sentences')}
            />
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, { marginBottom: tabBarHeight }]}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>{t('booksDaily.loading')}</ThemedText>
      </ThemedView>
    );
  }

  if (!dailyPlan) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, { marginBottom: tabBarHeight }]}>
        <ThemedText style={styles.noContentText}>{t('booksDaily.noContent')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="subtitle" style={styles.bookTitle}>
          {dailyPlan.bookId}
        </ThemedText>
        
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
    flexDirection: 'row',
    gap: 12,
  },
  singleButtonContainer: {
    justifyContent: 'center',
  },
  buttonSpacer: {
    width: 12,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noContentText: {
    fontSize: 18,
    textAlign: 'center',
  },
});