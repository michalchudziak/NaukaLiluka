import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BookListItem } from '@/components/BookListItem';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';
import { books } from '@/content/books';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookStore } from '@/store/book-store';
import { useSettingsStore } from '@/store/settings-store';
import type { Book } from '@/types/book';

export default function BooksListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const activeBook = useBookStore((s) => s.activeBookProgress);
  const settings = useSettingsStore();
  const bottomTabBarHeight = useBottomTabBarHeight();

  const handleBookPress = (bookIndex: number) => {
    router.push(`/book-display?bookIndex=${bookIndex}`);
  };

  const renderBook = ({ item, index }: { item: Book; index: number }) => {
    const isCompleted =
      index < (activeBook?.bookId ?? 0) ||
      (index === (activeBook?.bookId ?? 0) && (activeBook?.isCompleted ?? false));
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

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: metrics.screenPadding }]}>
        <ThemedText style={styles.title}>{t('booksList.title')}</ThemedText>
      </View>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.book.title}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: metrics.screenPadding,
            paddingBottom: bottomTabBarHeight + 12,
            maxWidth: metrics.maxContentWidth,
          },
        ]}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  header: {
    paddingTop: 12,
  },
  title: {
    ...forestCampTypography.display,
    fontSize: 30,
    lineHeight: 34,
    color: ForestCampTheme.colors.title,
  },
  listContent: {
    alignSelf: 'center',
    width: '100%',
    paddingTop: 12,
  },
  separator: {
    height: 12,
    backgroundColor: 'transparent',
  },
});
