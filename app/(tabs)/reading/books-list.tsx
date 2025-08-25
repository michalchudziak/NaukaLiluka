import { BookListItem } from '@/components/BookListItem';
import { ThemedView } from '@/components/ThemedView';
import { books } from '@/content/books';
import { DefaultSettings } from '@/services/default-settings';
import { useBookStore } from '@/store/book-store';
import { Book } from '@/types/book';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

export default function BooksListScreen() {
  const router = useRouter();
  const { bookProgress } = useBookStore();
  
  const handleBookPress = (bookIndex: number) => {
    router.push(`/book-display?bookIndex=${bookIndex}`);
  };
  
  const renderBook = ({ item, index }: { item: Book; index: number }) => {
    const progress = bookProgress.find(p => p.bookId === item.book.title);
    const isCompleted = progress?.isCompleted ?? false;
    console.log('isCompleted', isCompleted);
    const allowAllBooks = DefaultSettings.reading.books.allowAllBooks;
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
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.book.title}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
    backgroundColor: 'transparent',
  },
});