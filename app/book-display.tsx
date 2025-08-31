import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { books } from '@/content/books';
import { useSettingsStore } from '@/store/settings-store';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

type DisplayState = 'title' | 'sentences' | 'image' | 'summary';

export default function BookDisplayScreen() {
  const { bookIndex } = useLocalSearchParams<{ bookIndex: string }>();
  const router = useRouter();
  const { reading, hydrate } = useSettingsStore();

  const [currentPageIndex, setCurrentPageIndex] = useState(-1); // -1 for title
  const [displayState, setDisplayState] = useState<DisplayState>('title');

  const opacity = useSharedValue(1);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const fadeTransition = (callback: () => void) => {
    'worklet';
    opacity.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(callback)();
      opacity.value = withTiming(1, { duration: 100 });
    });
  };

  const applyWordSpacing = (text: string): string => {
    const spacing = reading.wordSpacing ?? 1;
    if (spacing === 1) return text;
    const spaces = ' '.repeat(spacing);
    return text.split(' ').join(spaces);
  };

  const book = books[parseInt(bookIndex || '0', 10)];
  if (!book) {
    router.back();
    return null;
  }

  const handlePress = () => {
    fadeTransition(() => {
      if (displayState === 'title') {
        // Move from title to first page sentences
        setCurrentPageIndex(0);
        setDisplayState('sentences');
      } else if (displayState === 'sentences') {
        // Move from sentences to image
        setDisplayState('image');
      } else if (displayState === 'image') {
        // Move to next page or show summary
        const nextPageIndex = currentPageIndex + 1;
        if (nextPageIndex < book.book.pages.length) {
          setCurrentPageIndex(nextPageIndex);
          setDisplayState('sentences');
        } else {
          // All pages shown, show summary
          setDisplayState('summary');
        }
      } else if (displayState === 'summary') {
        // From summary, navigate back
        router.back();
      }
    });
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
          {currentPage.sentences.map((sentence) => (
            <AutoSizeText
              key={sentence}
              color="#000000"
              style={styles.sentenceText}
              maxLength={Math.max(...currentPage.sentences.map((s) => applyWordSpacing(s).length))}
            >
              {applyWordSpacing(sentence)}
            </AutoSizeText>
          ))}
        </ThemedView>
      );
    }

    if (displayState === 'image') {
      return (
        <ThemedView style={styles.imageContainer}>
          <Image source={currentPage.image} style={styles.image} resizeMode="contain" />
        </ThemedView>
      );
    }

    if (displayState === 'summary') {
      // Collect all sentences from all pages
      const allSentences = book.book.pages.flatMap((page) => page.sentences);

      return (
        <ThemedView style={styles.summaryContainer}>
          <ThemedText color="#000000" style={styles.summaryTitle}>
            {book.book.title}
          </ThemedText>
          <ThemedView style={styles.summaryTextContainer}>
            <ThemedView>
              {allSentences.map((sentence) => (
                <ThemedText
                  key={sentence}
                  style={styles.summaryText}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.5}
                >
                  {applyWordSpacing(sentence)}
                </ThemedText>
              ))}
            </ThemedView>
          </ThemedView>
        </ThemedView>
      );
    }

    return null;
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <AnimatedThemedView style={[styles.content, animatedStyle]}>
        {renderContent()}
      </AnimatedThemedView>
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
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  summaryTitle: {
    fontSize: 60,
    fontWeight: 'bold',
    marginVertical: 20,
    paddingTop: 50,
  },
  summaryTextContainer: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 48,
    lineHeight: 48,
    marginVertical: 2,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#000000',
  },
});
