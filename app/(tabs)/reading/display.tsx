import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { AutoSizeText } from '@/components/AutoSizeText';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react';
import { DefaultSettings } from '@/services/default-settings';

export default function DisplayScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [items, setItems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [color, setColor] = useState<string>('#000');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
    
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined
      });
    };
  }, [navigation]);
  
  const maxTextLength = useMemo(() => {
    return Math.max(...items.map(item => item.length), 0);
  }, [items]);

  useEffect(() => {
    if (params.items) {
      try {
        const parsedItems = JSON.parse(params.items as string);
        setItems(parsedItems);
      } catch (e) {
        console.error('Failed to parse items:', e);
      }
    }
    if (params.color) {
      setColor(params.color as string);
    }
  }, [params.items, params.color]);

  useEffect(() => {
    if (items.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, DefaultSettings.reading.interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [items]);

  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      router.back();
    }
  }, [currentIndex, items.length, router]);

  if (items.length === 0) {
    return <ThemedView style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      {currentIndex >= 0 && currentIndex < items.length && (
        <AutoSizeText color={color} maxLength={maxTextLength}>
          {items[currentIndex]}
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