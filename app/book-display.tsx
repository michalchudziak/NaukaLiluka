import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';
import { books } from '@/content/books';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

type DisplayState = 'title' | 'sentences' | 'image';

export default function BookDisplayScreen() {
  const { bookIndex } = useLocalSearchParams<{ bookIndex: string }>();
  const router = useRouter();
  
  const [currentPageIndex, setCurrentPageIndex] = useState(-1); // -1 for title
  const [displayState, setDisplayState] = useState<DisplayState>('title');
  
  const book = books[parseInt(bookIndex || '0')];
  if (!book) {
    router.back();
    return null;
  }
  
  const handlePress = () => {
    if (displayState === 'title') {
      // Move from title to first page sentences
      setCurrentPageIndex(0);
      setDisplayState('sentences');
    } else if (displayState === 'sentences') {
      // Move from sentences to image
      setDisplayState('image');
    } else if (displayState === 'image') {
      // Move to next page or finish
      const nextPageIndex = currentPageIndex + 1;
      if (nextPageIndex < book.book.pages.length) {
        setCurrentPageIndex(nextPageIndex);
        setDisplayState('sentences');
      } else {
        // All pages shown, navigate back
        router.back();
      }
    }
  };

  
  const renderContent = () => {
    if (displayState === 'title') {
      return (
        <AutoSizeText color="#000000" style={styles.titleText}>
          {book.book.title}
        </AutoSizeText>
      );
    }
    
    const currentPage = book.book.pages[currentPageIndex];
    
    if (displayState === 'sentences') {
      return (
        <ThemedView style={styles.sentencesContainer}>
          {currentPage.sentences.map((sentence, index) => (
            <AutoSizeText 
              key={index} 
              color="#000000"
              style={styles.sentenceText}
              maxLength={Math.max(...currentPage.sentences.map(s => s.length))}
            >
              {sentence}
            </AutoSizeText>
          ))}
        </ThemedView>
      );
    }
    
    if (displayState === 'image') {
      // Map image filename to require statement
      const getImageSource = (imageName: string) => {
        const imageMap: { [key: string]: any } = {
          'karol.jpg': require('@/content/books/rodzina/karol.jpg'),
          'karolcia.jpg': require('@/content/books/rodzina/karolcia.jpg'),
          'mama.jpg': require('@/content/books/rodzina/mama.jpg'),
          'tata.jpg': require('@/content/books/rodzina/tata.jpg'),
          'lora.jpg': require('@/content/books/rodzina/lora.jpg'),
        };
        return imageMap[imageName] || null;
      };
      
      const imageSource = getImageSource(currentPage.image);
      
      if (!imageSource) {
        // If image not found, move to next page
        handlePress();
        return null;
      }
      
      return (
        <ThemedView style={styles.imageContainer}>
          <Image 
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        </ThemedView>
      );
    }
    
    return null;
  };
  
  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <ThemedView style={styles.content}>
        {renderContent()}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleText: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  sentencesContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  sentenceText: {
    marginVertical: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});