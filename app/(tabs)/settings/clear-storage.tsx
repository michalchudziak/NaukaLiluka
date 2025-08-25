import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/hooks/useTranslation';
import { AsyncStorageService } from '@/services/async-storage';
import { useBookStore } from '@/store/book-store';
import { useNoRepStore } from '@/store/no-rep-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function ClearStorageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);
  
  const bookStore = useBookStore();
  const noRepStore = useNoRepStore();

  const handleClearAll = async () => {
    Alert.alert(
      t('settings.clearStorage.confirmTitle'),
      t('settings.clearStorage.confirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              // Clear all AsyncStorage
              await AsyncStorage.clear();
              
              // Reset all stores to initial state
              bookStore.clearDailyPlan();
              noRepStore.clearAll();
              
              // Reinitialize stores
              await Promise.all([
                bookStore.hydrate(),
                noRepStore.hydrate(),
              ]);
              
              Alert.alert(
                t('settings.clearStorage.successTitle'),
                t('settings.clearStorage.successMessage'),
                [{ text: t('common.ok'), onPress: () => router.back() }]
              );
            } catch (error) {
              console.error('Error clearing storage:', error);
              Alert.alert(
                t('settings.clearStorage.errorTitle'),
                t('settings.clearStorage.errorMessage')
              );
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleClearBookProgress = async () => {
    Alert.alert(
      t('settings.clearStorage.confirmBookTitle'),
      t('settings.clearStorage.confirmBookMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              bookStore.clearDailyPlan();
              await AsyncStorageService.clear('progress.books');
              await bookStore.hydrate();
              
              Alert.alert(
                t('settings.clearStorage.successTitle'),
                t('settings.clearStorage.bookClearedMessage')
              );
            } catch (error) {
              console.error('Error clearing storage:', error);
              Alert.alert(
                t('settings.clearStorage.errorTitle'),
                t('settings.clearStorage.errorMessage')
              );
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleClearNoRep = async () => {
    Alert.alert(
      t('settings.clearStorage.confirmNoRepTitle'),
      t('settings.clearStorage.confirmNoRepMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              noRepStore.clearAll();
              await AsyncStorageService.clear('routines.reading.no-rep.words');
              await AsyncStorageService.clear('routines.reading.no-rep.sentences');
              await noRepStore.hydrate();
              
              Alert.alert(
                t('settings.clearStorage.successTitle'),
                t('settings.clearStorage.noRepClearedMessage')
              );
            } catch (error) {
              console.error('Error clearing storage:', error);
              Alert.alert(
                t('settings.clearStorage.errorTitle'),
                t('settings.clearStorage.errorMessage')
              );
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.warningCard}>
          <ThemedText style={styles.warningTitle}>
            {t('settings.clearStorage.warning')}
          </ThemedText>
          <ThemedText style={styles.warningText}>
            {t('settings.clearStorage.warningDescription')}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('settings.clearStorage.selectiveTitle')}
          </ThemedText>
          
          <View style={styles.buttonContainer}>
            <Button
              title={t('settings.clearStorage.clearBooks')}
              onPress={handleClearBookProgress}
              disabled={isClearing}
              style={styles.button}
            />
            
            <Button
              title={t('settings.clearStorage.clearNoRep')}
              onPress={handleClearNoRep}
              disabled={isClearing}
              style={styles.button}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('settings.clearStorage.completeTitle')}
          </ThemedText>
          
          <View style={styles.buttonContainer}>
            <Button
              title={t('settings.clearStorage.clearAll')}
              onPress={handleClearAll}
              disabled={isClearing}
              style={[styles.button, styles.destructiveButton]}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
});