import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { format, isToday, isYesterday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { books } from '@/content/books';
import { useTranslation } from '@/hooks/useTranslation';
import { HybridStorageService } from '@/services/hybrid-storage';

interface StorageData {
  bookStore: {
    bookProgress: any;
    trackSessions: any;
  };
  mathStore: {
    mathProgress: any;
    mathSessions: any[];
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

function DataRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string | number;
  valueStyle?: any;
}) {
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
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);

  const loadStorageData = useCallback(async () => {
    try {
      const [
        bookProgress,
        trackSessions,
        mathProgress,
        mathSessions,
        noRepWords,
        noRepSentences,
        routineWords,
        routineSentences,
        drawingPresentations,
        isCloudEnabled,
        allKeys,
      ] = await Promise.all([
        HybridStorageService.readBookProgress('progress.books'),
        HybridStorageService.readBookTrackSessions('routines.reading.book-track.sessions'),
        HybridStorageService.readMathProgress('progress.math'),
        HybridStorageService.readMathSessionCompletions('routines.math.sessions'),
        HybridStorageService.readNoRepWords('progress.reading.no-rep.words'),
        HybridStorageService.readNoRepSentences('progress.reading.no-rep.sentences'),
        HybridStorageService.readNoRepWordCompletions('routines.reading.no-rep.words'),
        HybridStorageService.readNoRepSentenceCompletions('routines.reading.no-rep.sentences'),
        HybridStorageService.readDrawingPresentations('progress.drawings.presentations'),
        HybridStorageService.getUseCloudData(),
        AsyncStorage.getAllKeys(),
      ]);

      setData({
        bookStore: {
          bookProgress: bookProgress || null,
          trackSessions: trackSessions || null,
        },
        mathStore: {
          mathProgress: mathProgress || null,
          mathSessions: mathSessions || [],
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
        isCloudEnabled: isCloudEnabled,
      });
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStorageData();
  }, [loadStorageData]);

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
      return (
        <ThemedText style={styles.emptyText}>{t('settings.viewStorage.noBookProgress')}</ThemedText>
      );
    }

    return progress.map((bookProgress: any, index: number) => {
      const byIndex = books[bookProgress.bookId];
      const bookData = byIndex || books.find((b) => b.book.title === bookProgress.bookTitle);

      // Get completed words and sentences based on completed triple indices
      const completedWords: string[] = [];
      const completedSentences: string[] = [];

      if (bookData) {
        (bookProgress.completedTriples || []).forEach((tripleIndex: number) => {
          if (bookData.words[tripleIndex]) {
            completedWords.push(...bookData.words[tripleIndex]);
          }
          if (bookData.sentences[tripleIndex]) {
            completedSentences.push(...bookData.sentences[tripleIndex]);
          }
        });
      }

      return (
        <View key={bookProgress.bookTitle ?? bookProgress.bookId ?? index} style={styles.bookItem}>
          <ThemedText style={styles.bookName}>
            {bookProgress.bookTitle || String(bookProgress.bookId)}
          </ThemedText>
          <View style={styles.progressInfo}>
            {completedWords.length > 0 && (
              <View style={styles.completedSection}>
                <ThemedText style={styles.completedTitle}>
                  {t('settings.viewStorage.completedWords')} ({completedWords.length}):
                </ThemedText>
                <View style={styles.itemsList}>
                  {completedWords.slice(0, 6).map((word) => (
                    <ThemedText key={`${bookProgress.bookId}-${word}`} style={styles.completedItem}>
                      • {word}
                    </ThemedText>
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
                  {completedSentences.slice(0, 3).map((sentence) => (
                    <ThemedText
                      key={`${bookProgress.bookId}-${sentence}`}
                      style={styles.completedItem}
                    >
                      • {sentence}
                    </ThemedText>
                  ))}
                  {completedSentences.length > 3 && (
                    <ThemedText style={styles.moreItems}>
                      ...{' '}
                      {t('settings.viewStorage.andMore', { count: completedSentences.length - 3 })}
                    </ThemedText>
                  )}
                </View>
              </View>
            )}

            {bookProgress.isCompleted && (
              <ThemedText style={styles.completedBadge}>
                {t('settings.viewStorage.completed')}
              </ThemedText>
            )}
          </View>
        </View>
      );
    });
  };

  const renderNoRepProgress = () => {
    const words = data?.noRepStore.displayedWords || [];
    const sentences = data?.noRepStore.displayedSentences || [];

    return (
      <View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{words.length}</ThemedText>
            <ThemedText style={styles.statLabel}>
              {t('settings.viewStorage.wordsCompleted')}
            </ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{sentences.length}</ThemedText>
            <ThemedText style={styles.statLabel}>
              {t('settings.viewStorage.sentencesCompleted')}
            </ThemedText>
          </View>
        </View>

        {words.length > 0 && (
          <View style={styles.recentItems}>
            <ThemedText style={styles.recentTitle}>
              {t('settings.viewStorage.recentWords')}
            </ThemedText>
            <View style={styles.itemsList}>
              {words
                .slice(-10)
                .reverse()
                .map((word) => (
                  <ThemedText key={word} style={styles.listItem}>
                    • {word}
                  </ThemedText>
                ))}
            </View>
          </View>
        )}

        {sentences.length > 0 && (
          <View style={styles.recentItems}>
            <ThemedText style={styles.recentTitle}>
              {t('settings.viewStorage.recentSentences')}
            </ThemedText>
            <View style={styles.itemsList}>
              {sentences
                .slice(-10)
                .reverse()
                .map((sentence) => (
                  <ThemedText key={sentence} style={styles.listItem}>
                    • {sentence}
                  </ThemedText>
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

    const todayWordCompletions = wordTimestamps.filter((ts) => isToday(new Date(ts))).length;
    const todaySentenceCompletions = sentenceTimestamps.filter((ts) =>
      isToday(new Date(ts))
    ).length;

    return (
      <View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{todayWordCompletions}</ThemedText>
            <ThemedText style={styles.statLabel}>{t('settings.viewStorage.todayWords')}</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{todaySentenceCompletions}</ThemedText>
            <ThemedText style={styles.statLabel}>
              {t('settings.viewStorage.todaySentences')}
            </ThemedText>
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
            {presentations
              .slice(-10)
              .reverse()
              .map((presentation, index) => (
                <View
                  key={`${presentation.setTitle}-${presentation.timestamp ?? index}`}
                  style={styles.dataRow}
                >
                  <ThemedText style={styles.listItem}>• {presentation.setTitle}</ThemedText>
                  <ThemedText style={styles.dataValue}>
                    {formatDate(presentation.timestamp)}
                  </ThemedText>
                </View>
              ))}
          </View>
        </View>
      </View>
    );
  };

  const renderMathProgress = () => {
    const progress = data?.mathStore.mathProgress;
    const sessions = data?.mathStore.mathSessions || [];

    if (!progress) {
      return <ThemedText style={styles.emptyText}>Brak postępów w matematyce</ThemedText>;
    }

    const todaySessions = sessions.filter((s) => isToday(new Date(s.timestamp)));
    const session1Completed = todaySessions.some((s) => s.session === 'session1');
    const session2Completed = todaySessions.some((s) => s.session === 'session2');

    return (
      <View>
        <DataRow label="Ukończone dni" value={`${progress.completedDays?.length || 0} / 30+`} />
        <DataRow label="Ostatnia praktyka" value={progress.lastPracticeDate || 'Brak'} />
        <DataRow
          label="Ostatni dzień ukończony"
          value={progress.lastDayCompleted ? 'Tak ✓' : 'Nie'}
          valueStyle={progress.lastDayCompleted ? styles.activeText : undefined}
        />

        <View style={styles.sessionsContainer}>
          <ThemedText style={styles.recentTitle}>Dzisiejsze sesje:</ThemedText>
          <View style={styles.sessionItem}>
            <ThemedText style={styles.sessionName}>Sesja 1 (Uporządkowane)</ThemedText>
            <View style={[styles.statusBadge, session1Completed && styles.completedStatusBadge]}>
              <ThemedText
                style={[styles.statusText, session1Completed && styles.completedStatusText]}
              >
                {session1Completed ? '✓ Ukończone' : 'Nieukończone'}
              </ThemedText>
            </View>
          </View>
          <View style={styles.sessionItem}>
            <ThemedText style={styles.sessionName}>Sesja 2 (Nieuporządkowane)</ThemedText>
            <View style={[styles.statusBadge, session2Completed && styles.completedStatusBadge]}>
              <ThemedText
                style={[styles.statusText, session2Completed && styles.completedStatusText]}
              >
                {session2Completed ? '✓ Ukończone' : 'Nieukończone'}
              </ThemedText>
            </View>
          </View>
        </View>

        {progress.completedDays && progress.completedDays.length > 0 && (
          <View style={styles.recentItems}>
            <ThemedText style={styles.recentTitle}>Ukończone dni:</ThemedText>
            <View style={styles.itemsList}>
              <ThemedText style={styles.listItem}>
                {progress.completedDays.sort((a: number, b: number) => a - b).join(', ')}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            marginBottom: tabBarHeight,
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Cloud Status Indicator */}
        <View style={styles.cloudStatusContainer}>
          <View
            style={[
              styles.cloudStatusBadge,
              data?.isCloudEnabled ? styles.cloudEnabledBadge : styles.localStorageBadge,
            ]}
          >
            <ThemedText style={styles.cloudStatusText}>
              {data?.isCloudEnabled ? '☁️ Dane z chmury' : '📱 Dane lokalne'}
            </ThemedText>
          </View>
        </View>

        <InfoCard title={t('settings.viewStorage.bookProgressTitle')}>
          {renderBookProgress()}
        </InfoCard>

        {/* Daily plan is now computed on the fly; no persisted plan to display */}

        <InfoCard title={t('settings.viewStorage.noRepProgressTitle')}>
          {renderNoRepProgress()}
        </InfoCard>

        <InfoCard title={t('settings.viewStorage.routinesTitle')}>{renderRoutines()}</InfoCard>

        <InfoCard title="Rysunki">{renderDrawingPresentations()}</InfoCard>

        <InfoCard title="Matematyka - Liczby">{renderMathProgress()}</InfoCard>

        <InfoCard title={t('settings.viewStorage.storageInfo')}>
          <DataRow label={t('settings.viewStorage.totalKeys')} value={data?.allKeys.length || 0} />
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
    backgroundColor: ForestCampTheme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 14,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: ForestCampTheme.colors.card,
    marginVertical: 8,
    marginBottom: 0,
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    padding: 16,
    ...forestCampSoftShadow,
  },
  cardTitle: {
    ...forestCampTypography.heading,
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 12,
    color: ForestCampTheme.colors.title,
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
    ...forestCampTypography.body,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
    flex: 1,
  },
  dataValue: {
    ...forestCampTypography.heading,
    fontSize: 14,
    color: ForestCampTheme.colors.title,
    textAlign: 'right',
    flex: 1,
  },
  emptyText: {
    ...forestCampTypography.body,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
    fontStyle: 'italic',
  },
  bookItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dbe8cf',
  },
  bookName: {
    ...forestCampTypography.heading,
    fontSize: 16,
    color: ForestCampTheme.colors.title,
    marginBottom: 4,
  },
  progressInfo: {
    gap: 4,
  },
  progressText: {
    ...forestCampTypography.body,
    fontSize: 13,
    color: ForestCampTheme.colors.textMuted,
  },
  completedBadge: {
    ...forestCampTypography.heading,
    fontSize: 12,
    color: ForestCampTheme.colors.success,
    marginTop: 4,
  },
  activeText: {
    color: ForestCampTheme.colors.primaryStrong,
    ...forestCampTypography.heading,
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
    ...forestCampTypography.heading,
    fontSize: 14,
    color: ForestCampTheme.colors.title,
  },
  sessionStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: ForestCampTheme.colors.cardMuted,
  },
  completedStatusBadge: {
    backgroundColor: '#dceecf',
  },
  statusText: {
    ...forestCampTypography.body,
    fontSize: 12,
    color: ForestCampTheme.colors.textMuted,
  },
  completedStatusText: {
    ...forestCampTypography.heading,
    color: ForestCampTheme.colors.primaryStrong,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.cardMuted,
    borderRadius: ForestCampTheme.radius.sm,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    ...forestCampTypography.display,
    fontSize: 24,
    lineHeight: 26,
    color: ForestCampTheme.colors.primaryStrong,
  },
  statLabel: {
    ...forestCampTypography.body,
    fontSize: 12,
    color: ForestCampTheme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  recentItems: {
    marginTop: 12,
  },
  recentTitle: {
    ...forestCampTypography.heading,
    fontSize: 14,
    color: ForestCampTheme.colors.title,
    marginBottom: 6,
  },
  itemsList: {
    gap: 4,
  },
  listItem: {
    ...forestCampTypography.body,
    fontSize: 13,
    color: ForestCampTheme.colors.text,
    paddingLeft: 8,
  },
  completedSection: {
    marginVertical: 4,
  },
  completedTitle: {
    ...forestCampTypography.heading,
    fontSize: 13,
    color: ForestCampTheme.colors.title,
    marginBottom: 4,
  },
  completedItem: {
    ...forestCampTypography.body,
    fontSize: 12,
    color: ForestCampTheme.colors.text,
    paddingLeft: 8,
    marginVertical: 2,
  },
  moreItems: {
    ...forestCampTypography.body,
    fontSize: 12,
    color: ForestCampTheme.colors.textMuted,
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
    borderWidth: 2,
  },
  cloudEnabledBadge: {
    backgroundColor: '#dcf0d1',
    borderColor: ForestCampTheme.colors.success,
  },
  localStorageBadge: {
    backgroundColor: ForestCampTheme.colors.cardMuted,
    borderColor: ForestCampTheme.colors.borderStrong,
  },
  cloudStatusText: {
    ...forestCampTypography.heading,
    fontSize: 14,
    color: ForestCampTheme.colors.title,
  },
});
