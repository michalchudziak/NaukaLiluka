import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
} from '@/constants/ForestCampTheme';
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
          backgroundColor:
            pressed && canInteract ? ForestCampTheme.colors.cardMuted : ForestCampTheme.colors.card,
          borderColor: ForestCampTheme.colors.border,
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
    borderRadius: ForestCampTheme.radius.lg,
    borderWidth: 2,
    ...forestCampSoftShadow,
  },
  bookContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bookTitle: {
    ...forestCampTypography.heading,
    fontSize: 18,
    color: ForestCampTheme.colors.title,
    marginBottom: 8,
  },
  bookStats: {
    gap: 4,
    backgroundColor: 'transparent',
  },
  bookInfo: {
    ...forestCampTypography.body,
    fontSize: 14,
    color: ForestCampTheme.colors.textMuted,
  },
  disabledText: {
    opacity: 0.6,
  },
});
