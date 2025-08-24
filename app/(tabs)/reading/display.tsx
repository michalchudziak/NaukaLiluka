import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function DisplayScreen() {
  const params = useLocalSearchParams();
  const [items, setItems] = useState<string[]>([]);
  const [color, setColor] = useState<string>('#000');

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
  }, [params]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <ThemedText style={[styles.itemText, { color }]}>
              {item}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  itemContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  itemText: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
});