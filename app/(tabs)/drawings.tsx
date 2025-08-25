import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import drawingsData from '@/content/drawings/index';
import { useTranslation } from '@/hooks/useTranslation';
import { useDrawingsStore } from '@/store/drawings-store';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, SafeAreaView, StyleSheet } from 'react-native';

export default function DrawingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const drawingsStore = useDrawingsStore();
  const todayTotal = drawingsStore.getTodayPresentationCount();

  const handleSetPress = (setTitle: string) => {
    router.push({
      pathname: '/drawing-display',
      params: { setId: setTitle }
    });
  };

  const renderItem = ({ item }: { item: typeof drawingsData[0] }) => {
    const count = drawingsStore.getTodaySetPresentationCount(item.title);
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.setCard,
          pressed && styles.setCardPressed
        ]}
        onPress={() => handleSetPress(item.title)}
      >
        <ThemedView style={styles.setCardContent}>
          <ThemedText type="defaultSemiBold" style={styles.setTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.setCount}>
            {t('drawings.presentedToday', { count })}
          </ThemedText>
        </ThemedView>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.totalCounter}>
            {t('drawings.totalToday', { count: todayTotal })}
          </ThemedText>
        </ThemedView>
        
        <FlatList
          data={drawingsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  totalCounter: {
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
  },
  setCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  setCardPressed: {
    backgroundColor: '#e0e0e0',
  },
  setCardContent: {
    backgroundColor: 'transparent',
  },
  setTitle: {
    marginBottom: 4,
  },
  setCount: {
    color: '#666',
  },
  separator: {
    height: 12,
  },
});
