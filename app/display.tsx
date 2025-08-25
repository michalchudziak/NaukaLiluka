import { AutoSizeText } from '@/components/AutoSizeText';
import { ThemedView } from '@/components/ThemedView';
import { DefaultSettings } from '@/services/default-settings';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function DisplayScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  

  const parsedItems = useMemo(() => JSON.parse(params.items as string) as string[], [params.items]);
  const color = params.color as string;
  
  const maxTextLength = useMemo(() => {
    return Math.max(...parsedItems.map(item => item.length), 0);
  }, [parsedItems]);

  useEffect(() => {
    if (parsedItems.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>  prevIndex + 1);
    }, DefaultSettings.reading.interval[params.type as 'words' | 'sentences']);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentIndex >= parsedItems.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      router.back();
    }
  }, [currentIndex]);

  if (parsedItems.length === 0) {
    return <ThemedView style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      {currentIndex >= 0 && currentIndex < parsedItems.length && (
        <AutoSizeText color={color} maxLength={maxTextLength}>
          {parsedItems[currentIndex]}
        </AutoSizeText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});