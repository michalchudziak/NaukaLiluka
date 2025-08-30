import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import type { Book } from '@/types/book';

interface BookListItemProps {
  book: Book;
  isCompleted: boolean;
  isAccessible: boolean;
  onPress: () => void;
}

export function BookListItem({ book, isCompleted, isAccessible, onPress }: BookListItemProps) {
  const canInteract = isCompleted || isAccessible;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookItem,
        {
          backgroundColor: pressed && canInteract ? '#f0f0f0' : '#ffffff',
          borderColor: '#e0e0e0',
          opacity: canInteract ? 1 : 0.4,
        },
      ]}
      onPress={canInteract ? onPress : undefined}
      disabled={!canInteract}
    >
      <ThemedView style={styles.bookContent}>
        <ThemedText style={[styles.bookTitle, !canInteract && styles.disabledText]}>
          {book.book.title}
        </ThemedText>
        <ThemedView style={styles.bookStats}>
          <ThemedText style={[styles.bookInfo, !canInteract && styles.disabledText]}>
            {book.book.pages.length} stron
          </ThemedText>
          <ThemedText style={[styles.bookInfo, !canInteract && styles.disabledText]}>
            {book.words.length} zestawów słów
          </ThemedText>
          <ThemedText style={[styles.bookInfo, !canInteract && styles.disabledText]}>
            {book.sentences.length} zestawów zdań
          </ThemedText>
        </ThemedView>
      </ThemedView>
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
  disabledText: {
    opacity: 0.6,
  },
});
