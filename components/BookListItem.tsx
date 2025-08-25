import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Book } from '@/types/book';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

interface BookListItemProps {
  book: Book;
  isCompleted: boolean;
  onPress: () => void;
}

export function BookListItem({ book, isCompleted, onPress }: BookListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookItem,
        { 
          backgroundColor: pressed 
            ? '#f0f0f0'
            : '#ffffff',
          borderColor: '#e0e0e0',
        }
      ]}
      onPress={onPress}
    >
      <ThemedView style={styles.bookContent}>
        <ThemedText style={styles.bookTitle}>{book.book.title}</ThemedText>
        <ThemedView style={styles.bookStats}>
          <ThemedText style={styles.bookInfo}>
            {book.book.pages.length} stron
          </ThemedText>
          <ThemedText style={styles.bookInfo}>
            {book.words.length} zestawów słów
          </ThemedText>
          <ThemedText style={styles.bookInfo}>
            {book.sentences.length} zestawów zdań
          </ThemedText>
        </ThemedView>
      </ThemedView>
      {isCompleted && (<ThemedText style={styles.checkmark}>✅</ThemedText>)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bookContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bookStats: {
    gap: 4,
    backgroundColor: 'transparent',
  },
  bookInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
  checkmark: {
    fontSize: 24,
    padding: 10,
  },
});