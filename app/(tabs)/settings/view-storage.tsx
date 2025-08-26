import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { books } from '@/content/books';
import { useTranslation } from '@/hooks/useTranslation';
import { HybridStorageService } from '@/services/hybrid-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { format, isToday, isYesterday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

interface StorageData {
  bookStore: {
    bookProgress: any;
    dailyPlan: any;
    trackSessions: any;
  };
  noRepStore: {
    displayedWords: string[];
    displayedSentences: string[];
  };
  routines: {
    wordTimestamps: number[];
    sentenceTimestamps: number[];
  };
  drawingPresentations: any[];
  allKeys: readonly string[];
  isCloudEnabled: boolean;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return `Dzisiaj o ${format(date, 'HH:mm')}`;
  }
  if (isYesterday(date)) {
    return `Wczoraj o ${format(date, 'HH:mm')}`;
  }
  return format(date, 'd MMMM yyyy, HH:mm', { locale: pl });
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

function DataRow({ label, value, valueStyle }: { label: string; value: string | number; valueStyle?: any }) {
  return (
    <View style={styles.dataRow}>
      <ThemedText style={styles.dataLabel}>{label}</ThemedText>
      <ThemedText style={[styles.dataValue, valueStyle]}>{value}</ThemedText>
    </View>
  );
}

export default function ViewStorageScreen() {
  const { t } = useTranslation();
  const [data, setData] = useState<StorageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const loadStorageData = async () => {
    try {
      const [
        bookProgress,
        dailyPlan,
        trackSessions,
        noRepWords,
        noRepSentences,
        routineWords,
        routineSentences,
        drawingPresentations,
        isCloudEnabled,
        allKeys
      ] = await Promise.all([
        HybridStorageService.readBookProgress('progress.books'),
        HybridStorageService.readDailyPlan('progress.books.daily-plan'),
        HybridStorageService.readBookTrackSessions('progress.books.track'),
        HybridStorageService.readNoRepWords('progress.reading.no-rep.words'),
        HybridStorageService.readNoRepSentences('progress.reading.no-rep.sentences'),
        HybridStorageService.readNoRepWordCompletions('routines.reading.no-rep.words'),
        HybridStorageService.readNoRepSentenceCompletions('routines.reading.no-rep.sentences'),
        HybridStorageService.readDrawingPresentations('progress.drawings.presentations'),
        HybridStorageService.getUseCloudData(),
        AsyncStorage.getAllKeys()
      ]);

      setData({
        bookStore: {
          bookProgress: bookProgress || null,
          dailyPlan: dailyPlan || null,
          trackSessions: trackSessions || null,
        },
        noRepStore: {
          displayedWords: noRepWords || [],
          displayedSentences: noRepSentences || [],
        },
        routines: {
          wordTimestamps: routineWords || [],
          sentenceTimestamps: routineSentences || [],
        },
        drawingPresentations: drawingPresentations || [],
        allKeys: allKeys || [],
        isCloudEnabled: isCloudEnabled
      });
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStorageData();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const renderBookProgress = () => {
    const progress = data?.bookStore.bookProgress;
    if (!progress || progress.length === 0) {
      return <ThemedText style={styles.emptyText}>{t('settings.viewStorage.noBookProgress')}</ThemedText>;
    }

    return progress.map((bookProgress: any, index: number) => {
      const bookData = books.find(b => b.book.title === bookProgress.bookId);
      
      // Get completed words and sentences based on completed triple indices
      const completedWords: string[] = [];
      const completedSentences: string[] = [];
      
      if (bookData) {
        bookProgress.completedWordTriples?.forEach((tripleIndex: number) => {
          if (bookData.words[tripleIndex]) {
            completedWords.push(...bookData.words[tripleIndex]);
          }
        });
        
        bookProgress.completedSentenceTriples?.forEach((tripleIndex: number) => {
          if (bookData.sentences[tripleIndex]) {
            completedSentences.push(...bookData.sentences[tripleIndex]);
          }
        });
      }
      
      return (
        <View key={index} style={styles.bookItem}>
          <ThemedText style={styles.bookName}>{bookProgress.bookId}</ThemedText>
          <View style={styles.progressInfo}>
            {completedWords.length > 0 && (
              <View style={styles.completedSection}>
                <ThemedText style={styles.completedTitle}>
                  {t('settings.viewStorage.completedWords')} ({completedWords.length}):
                </ThemedText>
                <View style={styles.itemsList}>
                  {completedWords.slice(0, 6).map((word, idx) => (
                    <ThemedText key={idx} style={styles.completedItem}>• {word}</ThemedText>
                  ))}
                  {completedWords.length > 6 && (
                    <ThemedText style={styles.moreItems}>
                      ... {t('settings.viewStorage.andMore', { count: completedWords.length - 6 })}
                    </ThemedText>
                  )}
                </View>
              </View>
            )}
            
            {completedSentences.length > 0 && (
              <View style={[styles.completedSection, { marginTop: 8 }]}>
                <ThemedText style={styles.completedTitle}>
                  {t('settings.viewStorage.completedSentences')} ({completedSentences.length}):
                </ThemedText>
                <View style={styles.itemsList}>
                  {completedSentences.slice(0, 3).map((sentence, idx) => (
                    <ThemedText key={idx} style={styles.completedItem}>• {sentence}</ThemedText>
                  ))}
                  {completedSentences.length > 3 && (
                    <ThemedText style={styles.moreItems}>
                      ... {t('settings.viewStorage.andMore', { count: completedSentences.length - 3 })}
                    </ThemedText>
                  )}
                </View>
              </View>
            )}
            
            {bookProgress.isCompleted && (
              <ThemedText style={styles.completedBadge}>{t('settings.viewStorage.completed')}</ThemedText>
            )}
          </View>
        </View>
      );
    });
  };

  const renderDailyPlan = () => {
    const plan = data?.bookStore.dailyPlan;
    if (!plan) {
      return <ThemedText style={styles.emptyText}>{t('settings.viewStorage.noDailyPlan')}</ThemedText>;
    }

    const today = new Date().toISOString().split('T')[0];
    const isActive = plan.date === today;

    return (
      <View>
        <DataRow 
          label={t('settings.viewStorage.planDate')} 
          value={isActive ? t('settings.viewStorage.today') : plan.date}
          valueStyle={isActive ? styles.activeText : undefined}
        />
        <DataRow label={t('settings.viewStorage.book')} value={plan.bookId} />
        
        <View style={styles.sessionsContainer}>
          {['session1', 'session2', 'session3'].map((sessionKey) => {
            const session = plan.sessions[sessionKey];
            const hasWords = session.words?.length > 0;
            const hasSentences = session.sentences?.length > 0;
            
            return (
              <View key={sessionKey} style={styles.sessionItem}>
                <ThemedText style={styles.sessionName}>
                  {t(`booksDaily.${sessionKey}`)}
                </ThemedText>
                <View style={styles.sessionStatus}>
                  {hasWords && (
                    <View style={[styles.statusBadge, session.isWordsCompleted && styles.completedStatusBadge]}>
                      <ThemedText style={[styles.statusText, session.isWordsCompleted && styles.completedStatusText]}>
                        {t('settings.viewStorage.words')} {session.isWordsCompleted ? '✓' : `(${session.words.length})`}
                      </ThemedText>
                    </View>
                  )}
                  {hasSentences && (
                    <View style={[styles.statusBadge, session.isSentencesCompleted && styles.completedStatusBadge]}>
                      <ThemedText style={[styles.statusText, session.isSentencesCompleted && styles.completedStatusText]}>
                        {t('settings.viewStorage.sentences')} {session.isSentencesCompleted ? '✓' : `(${session.sentences.length})`}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderNoRepProgress = () => {
    const words = data?.noRepStore.displayedWords || [];
    const sentences = data?.noRepStore.displayedSentences || [];
    
    return (
      <View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{words.length}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('settings.viewStorage.wordsCompleted')}</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{sentences.length}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('settings.viewStorage.sentencesCompleted')}</ThemedText>
          </View>
        </View>
        
        {words.length > 0 && (
          <View style={styles.recentItems}>
            <ThemedText style={styles.recentTitle}>{t('settings.viewStorage.recentWords')}</ThemedText>
            <View style={styles.itemsList}>
              {words.slice(-10).reverse().map((word, index) => (
                <ThemedText key={index} style={styles.listItem}>• {word}</ThemedText>
              ))}
            </View>
          </View>
        )}
        
        {sentences.length > 0 && (
          <View style={styles.recentItems}>
            <ThemedText style={styles.recentTitle}>{t('settings.viewStorage.recentSentences')}</ThemedText>
            <View style={styles.itemsList}>
              {sentences.slice(-10).reverse().map((sentence, index) => (
                <ThemedText key={index} style={styles.listItem}>• {sentence}</ThemedText>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderRoutines = () => {
    const wordTimestamps = data?.routines.wordTimestamps || [];
    const sentenceTimestamps = data?.routines.sentenceTimestamps || [];
    
    const lastWordCompletion = wordTimestamps[wordTimestamps.length - 1];
    const lastSentenceCompletion = sentenceTimestamps[sentenceTimestamps.length - 1];
    
    const todayWordCompletions = wordTimestamps.filter(ts => isToday(new Date(ts))).length;
    const todaySentenceCompletions = sentenceTimestamps.filter(ts => isToday(new Date(ts))).length;
    
    return (
      <View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{todayWordCompletions}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('settings.viewStorage.todayWords')}</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{todaySentenceCompletions}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('settings.viewStorage.todaySentences')}</ThemedText>
          </View>
        </View>
        
        {lastWordCompletion && (
          <DataRow 
            label={t('settings.viewStorage.lastWordCompletion')} 
            value={formatDate(lastWordCompletion)}
          />
        )}
        
        {lastSentenceCompletion && (
          <DataRow 
            label={t('settings.viewStorage.lastSentenceCompletion')} 
            value={formatDate(lastSentenceCompletion)}
          />
        )}
        
        <DataRow 
          label={t('settings.viewStorage.totalCompletions')} 
          value={`${wordTimestamps.length + sentenceTimestamps.length}`}
        />
      </View>
    );
  };

  const renderDrawingPresentations = () => {
    const presentations = data?.drawingPresentations || [];
    
    if (presentations.length === 0) {
      return <ThemedText style={styles.emptyText}>Brak wyświetlonych zestawów rysunków</ThemedText>;
    }

    return (
      <View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{presentations.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Wyświetlonych zestawów</ThemedText>
          </View>
        </View>
        
        <View style={styles.recentItems}>
          <ThemedText style={styles.recentTitle}>Ostatnio wyświetlone zestawy:</ThemedText>
          <View style={styles.itemsList}>
            {presentations.slice(-10).reverse().map((presentation, index) => (
              <View key={index} style={styles.dataRow}>
                <ThemedText style={styles.listItem}>• {presentation.setTitle}</ThemedText>
                <ThemedText style={styles.dataValue}>{formatDate(presentation.timestamp)}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cloud Status Indicator */}
        <View style={styles.cloudStatusContainer}>
          <View style={[styles.cloudStatusBadge, data?.isCloudEnabled ? styles.cloudEnabledBadge : styles.localStorageBadge]}>
            <ThemedText style={styles.cloudStatusText}>
              {data?.isCloudEnabled ? '☁️ Dane z chmury' : '📱 Dane lokalne'}
            </ThemedText>
          </View>
        </View>

        <InfoCard title={t('settings.viewStorage.bookProgressTitle')}>
          {renderBookProgress()}
        </InfoCard>

        <InfoCard title={t('settings.viewStorage.dailyPlanTitle')}>
          {renderDailyPlan()}
        </InfoCard>

        <InfoCard title={t('settings.viewStorage.noRepProgressTitle')}>
          {renderNoRepProgress()}
        </InfoCard>

        <InfoCard title={t('settings.viewStorage.routinesTitle')}>
          {renderRoutines()}
        </InfoCard>

        <InfoCard title="Rysunki">
          {renderDrawingPresentations()}
        </InfoCard>

        <InfoCard title={t('settings.viewStorage.storageInfo')}>
          <DataRow 
            label={t('settings.viewStorage.totalKeys')} 
            value={data?.allKeys.length || 0}
          />
          <DataRow 
            label="Źródło danych" 
            value={data?.isCloudEnabled ? 'Chmura' : 'Lokalne'}
            valueStyle={data?.isCloudEnabled ? styles.activeText : undefined}
          />
        </InfoCard>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  cardContent: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  bookItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  bookName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  progressInfo: {
    gap: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
  },
  completedBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  activeText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  sessionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  sessionStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  completedStatusBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  completedStatusText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  recentItems: {
    marginTop: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  itemsList: {
    gap: 4,
  },
  listItem: {
    fontSize: 13,
    color: '#444',
    paddingLeft: 8,
  },
  completedSection: {
    marginVertical: 4,
  },
  completedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedItem: {
    fontSize: 12,
    color: '#555',
    paddingLeft: 8,
    marginVertical: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    paddingLeft: 8,
    marginTop: 2,
  },
  cloudStatusContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  cloudStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  cloudEnabledBadge: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  localStorageBadge: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
  },
  cloudStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});