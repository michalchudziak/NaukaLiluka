import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Platform, Switch, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { widgetService, RoutineState } from '@/services/widgetService';
import { useTranslation } from '@/hooks/useTranslation';

export function RoutineWidgetManager() {
  const { t } = useTranslation();
  const [routineState, setRoutineState] = useState<RoutineState>({
    routine1: false,
    routine2: false,
    routine3: false,
    routine4: false,
    routine5: false,
    lastUpdated: new Date(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutineState();
  }, []);

  const loadRoutineState = async () => {
    setLoading(true);
    try {
      await widgetService.initialize();
      const state = await widgetService.getRoutineState();
      setRoutineState(state);
    } catch (error) {
      console.error('Failed to load routine state:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoutine = async (routineNumber: 1 | 2 | 3 | 4 | 5) => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Widgets are only available on iOS devices.');
      return;
    }

    const key = `routine${routineNumber}` as keyof RoutineState;
    const currentValue = routineState[key] as boolean;
    
    try {
      if (currentValue) {
        await widgetService.resetRoutine(routineNumber);
      } else {
        await widgetService.completeRoutine(routineNumber);
      }
      
      const newState = await widgetService.getRoutineState();
      setRoutineState(newState);
    } catch (error) {
      Alert.alert('Error', `Failed to update routine: ${error}`);
    }
  };

  const routineLabels = [
    t('myDay.routine1'),
    t('myDay.routine2'),
    t('myDay.routine3'),
    t('myDay.routine4'),
    t('myDay.routine5'),
  ];

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Widget Rutyn</ThemedText>
      
      <View style={styles.infoSection}>
        <ThemedText style={styles.infoText}>
          Widget pokazuje stan twoich dziennych rutyn na ekranie głównym.
        </ThemedText>
        
        <ThemedText style={styles.instructionTitle}>
          Aby dodać widget:
        </ThemedText>
        
        <ThemedText style={styles.instructionText}>
          1. Przytrzymaj palec na ekranie głównym
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          2. Naciśnij przycisk +
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          3. Znajdź aplikację
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          4. Wybierz widget &quot;Rutyny Dnia&quot;
        </ThemedText>
      </View>

      <View style={styles.routinesSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Dzisiejsze rutyny
        </ThemedText>
        
        {[1, 2, 3, 4, 5].map((num) => {
          const key = `routine${num}` as keyof RoutineState;
          const value = routineState[key] as boolean;
          
          return (
            <View key={num} style={styles.routineRow}>
              <ThemedText style={styles.routineLabel}>
                {routineLabels[num - 1]}
              </ThemedText>
              <Switch
                value={value}
                onValueChange={() => toggleRoutine(num as 1 | 2 | 3 | 4 | 5)}
                trackColor={{ false: '#767577', true: '#d303fc' }}
                thumbColor={value ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Odśwież Widget" 
          onPress={loadRoutineState}
          color="#d303fc"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 30,
  },
  infoText: {
    marginBottom: 15,
    fontSize: 14,
    opacity: 0.8,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 13,
    marginLeft: 10,
    marginBottom: 5,
    opacity: 0.7,
  },
  routinesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  routineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(211, 3, 252, 0.05)',
    marginBottom: 8,
    borderRadius: 8,
  },
  routineLabel: {
    fontSize: 15,
  },
  buttonContainer: {
    marginTop: 20,
  },
});