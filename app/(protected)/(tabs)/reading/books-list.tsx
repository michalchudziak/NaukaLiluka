import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BookListItem } from '@/components/BookListItem';
import { GuideCard } from '@/components/GuideCard';
import { ThemedView } from '@/components/ThemedView';
import { ForestCampTheme, getForestCampMetrics, spacing } from '@/constants/ForestCampTheme';
import { books } from '@/content/books';
import { useBookListProgress, useBookStatus } from '@/hooks/useBooks';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settings-store';
import type { Book } from '@/types/book';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const guideImage = require('@/assets/images/guides/book.png');

function ListSeparator() {
  return <ThemedView style={styles.separator} />;
}

export default function BooksListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const bookStatus = useBookStatus();
  const progressList = useBookListProgress();
  const settings = useSettingsStore();
  const bottomTabBarHeight = useBottomTabBarHeight();

  const handleBookPress = (bookIndex: number) => {
    router.push(`/book-display?bookIndex=${bookIndex}`);
  };

  const renderBook = ({ item, index }: { item: Book; index: number }) => {
    const isCompleted =
      index < (bookStatus?.activeBookIndex ?? 0) ||
      (index === (bookStatus?.activeBookIndex ?? 0) &&
        (bookStatus?.activeBookCompleted ?? false)) ||
      (progressList?.some((p) => p.bookIndex === index && p.isCompleted) ?? false);
    const allowAllBooks = settings.reading.books.allowAllBooks;
    const isAccessible = allowAllBooks || isCompleted;

    return (
      <BookListItem
        book={item}
        isCompleted={isCompleted}
        isAccessible={isAccessible}
        onPress={() => handleBookPress(index)}
      />
    );
  };

  const listHeader = (
    <View style={styles.headerContent}>
      <GuideCard
        image={guideImage}
        title={t('booksList.guideTitle')}
        body={t('booksList.guideBody')}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.book.title}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: metrics.screenPadding,
            paddingBottom: bottomTabBarHeight + spacing.md,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        ItemSeparatorComponent={ListSeparator}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  headerContent: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  listContent: {
    alignSelf: 'center',
    width: '100%',
  },
  separator: {
    height: 12,
    backgroundColor: 'transparent',
  },
});
