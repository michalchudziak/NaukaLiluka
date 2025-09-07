import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/hooks/useTranslation';
import { AsyncStorageService } from '@/services/async-storage';
import { useBookStore } from '@/store/book-store';
import { useDrawingsStore } from '@/store/drawings-store';
import { useMathStore } from '@/store/math-store';
import { useNoRepStore } from '@/store/no-rep-store';
import { useSettingsStore } from '@/store/settings-store';

export default function ClearStorageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  const bookStore = useBookStore();
  const noRepStore = useNoRepStore();
  const drawingsStore = useDrawingsStore();
  const settingsStore = useSettingsStore();
  const mathStore = useMathStore();

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
              // Clear all AsyncStorage - this wipes everything
              await AsyncStorage.clear();

              // Reinitialize all stores with default values
              await Promise.all([
                bookStore.hydrate(),
                noRepStore.hydrate(),
                drawingsStore.hydrate(),
                settingsStore.hydrate(),
                mathStore.hydrate(),
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
              // Clear all book-related storage keys
              await AsyncStorageService.clear('progress.books');
              await AsyncStorageService.clear('progress.books.daily-plan');
              await AsyncStorageService.clear('routines.reading.book-track.sessions');

              // Reinitialize book store
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

  const handleClearDrawings = async () => {
    Alert.alert(
      t('settings.clearStorage.confirmDrawingsTitle'),
      t('settings.clearStorage.confirmDrawingsMessage'),
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
              // Clear drawings storage
              await AsyncStorageService.clear('progress.drawings.presentations');

              // Reinitialize drawings store
              await drawingsStore.hydrate();

              Alert.alert(
                t('settings.clearStorage.successTitle'),
                t('settings.clearStorage.drawingsClearedMessage')
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

  const handleClearSettings = async () => {
    Alert.alert(
      t('settings.clearStorage.confirmSettingsTitle'),
      t('settings.clearStorage.confirmSettingsMessage'),
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
              // Clear settings storage
              await AsyncStorageService.clear('settings');

              // Reinitialize settings store with defaults
              await settingsStore.hydrate();

              Alert.alert(
                t('settings.clearStorage.successTitle'),
                t('settings.clearStorage.settingsClearedMessage')
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

  const handleClearMath = async () => {
    Alert.alert(
      t('settings.clearStorage.confirmMathTitle'),
      t('settings.clearStorage.confirmMathMessage'),
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
              // Clear all math related storage keys
              await AsyncStorageService.clear('progress.math');
              await AsyncStorageService.clear('routines.math.sessions');

              // Reinitialize math store
              await mathStore.hydrate();

              Alert.alert(
                t('settings.clearStorage.successTitle'),
                t('settings.clearStorage.mathClearedMessage')
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
              // Clear all no-rep related storage keys
              await AsyncStorageService.clear('progress.reading.no-rep.words');
              await AsyncStorageService.clear('progress.reading.no-rep.sentences');
              await AsyncStorageService.clear('routines.reading.no-rep.words');
              await AsyncStorageService.clear('routines.reading.no-rep.sentences');

              // Reinitialize no-rep store
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
          <ThemedText style={styles.warningTitle}>{t('settings.clearStorage.warning')}</ThemedText>
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

            <Button
              title={t('settings.clearStorage.clearDrawings')}
              onPress={handleClearDrawings}
              disabled={isClearing}
              style={styles.button}
            />

            <Button
              title={t('settings.clearStorage.clearSettings')}
              onPress={handleClearSettings}
              disabled={isClearing}
              style={styles.button}
            />

            <Button
              title={t('settings.clearStorage.clearMath')}
              onPress={handleClearMath}
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
