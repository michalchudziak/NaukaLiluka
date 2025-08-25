import { BookListItem } from '@/components/BookListItem';
import { ThemedView } from '@/components/ThemedView';
import { books } from '@/content/books';
import { useBookStore } from '@/store/book-store';
import { Book } from '@/types/book';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

export default function BooksListScreen() {
  const router = useRouter();
  const { bookProgress } = useBookStore();
  
  const handleBookPress = () => {
    // Navigate to book-track when a book is pressed
    router.push('/reading/book-track');
  };
  
  const renderBook = ({ item }: { item: Book }) => {
    const progress = bookProgress.find(p => p.bookId === item.book.title);
    const isCompleted = progress?.isCompleted ?? false;
    
    return (
      <BookListItem
        book={item}
        isCompleted={isCompleted}
        onPress={handleBookPress}
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