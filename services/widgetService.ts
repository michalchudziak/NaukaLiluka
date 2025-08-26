import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { supabase } from './supabase';

const WidgetModule = NativeModules.ReactNativeWidgetExtension;

export interface RoutineState {
  routine1: boolean;
  routine2: boolean;
  routine3: boolean;
  routine4: boolean;
  routine5: boolean;
  lastUpdated: Date;
}

class WidgetService {
  private routineState: RoutineState = {
    routine1: false,
    routine2: false,
    routine3: false,
    routine4: false,
    routine5: false,
    lastUpdated: new Date(),
  };

  async initialize() {
    if (Platform.OS !== 'ios') return;
    
    // Load state from widget (which may have been updated while app was closed)
    await this.loadStateFromWidget();
    
    // Check if cloud storage is enabled and rehydrate if needed
    const cloudEnabled = await AsyncStorage.getItem('cloudStorageEnabled');
    if (cloudEnabled === 'true') {
      await this.rehydrateFromSupabase();
    }
  }

  private async loadStateFromWidget() {
    if (!WidgetModule?.getRoutineState) return;
    
    try {
      const state = await WidgetModule.getRoutineState();
      this.routineState = {
        routine1: state.routine1 || false,
        routine2: state.routine2 || false,
        routine3: state.routine3 || false,
        routine4: state.routine4 || false,
        routine5: state.routine5 || false,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to load widget state:', error);
    }
  }

  private async rehydrateFromSupabase() {
    try {
      return;
    } catch (error) {
      console.error('Failed to rehydrate from Supabase:', error);
    }
  }

  async completeRoutine(routineNumber: 1 | 2 | 3 | 4 | 5) {
    const key = `routine${routineNumber}` as keyof RoutineState;
    this.routineState[key] = true as any;
    this.routineState.lastUpdated = new Date();
    
    // Update widget
    await this.updateWidget();
    
    // Save to Supabase if cloud storage is enabled
    const cloudEnabled = await AsyncStorage.getItem('cloudStorageEnabled');
    if (cloudEnabled === 'true') {
      await this.saveToSupabase(routineNumber, true);
    }
    
    // Save to local storage
    await this.saveToLocalStorage();
  }

  async resetRoutine(routineNumber: 1 | 2 | 3 | 4 | 5) {
    const key = `routine${routineNumber}` as keyof RoutineState;
    this.routineState[key] = false as any;
    this.routineState.lastUpdated = new Date();
    
    // Update widget
    await this.updateWidget();
    
    // Save to Supabase if cloud storage is enabled
    const cloudEnabled = await AsyncStorage.getItem('cloudStorageEnabled');
    if (cloudEnabled === 'true') {
      await this.saveToSupabase(routineNumber, false);
    }
    
    // Save to local storage
    await this.saveToLocalStorage();
  }

  async getRoutineState(): Promise<RoutineState> {
    // Check if it's a new day and reset if needed
    const today = new Date().toDateString();
    const lastUpdated = new Date(this.routineState.lastUpdated).toDateString();
    
    if (today !== lastUpdated) {
      this.routineState = {
        routine1: false,
        routine2: false,
        routine3: false,
        routine4: false,
        routine5: false,
        lastUpdated: new Date(),
      };
      await this.updateWidget();
    }
    
    return this.routineState;
  }

  private async updateWidget() {
    if (Platform.OS !== 'ios' || !WidgetModule?.updateRoutineState) return;
    
    try {
      await WidgetModule.updateRoutineState(
        this.routineState.routine1,
        this.routineState.routine2,
        this.routineState.routine3,
        this.routineState.routine4,
        this.routineState.routine5
      );
    } catch (error) {
      console.error('Failed to update widget:', error);
    }
  }

  private async saveToSupabase(routineNumber: number, completed: boolean) {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('routine_completions')
        .upsert({
          user_id: userId,
          date: today,
          routine_number: routineNumber,
          completed: completed,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date,routine_number'
        });

      if (error) {
        console.error('Failed to save routine to Supabase:', error);
      }
    } catch (error) {
      console.error('Failed to save to Supabase:', error);
    }
  }

  private async saveToLocalStorage() {
    try {
      await AsyncStorage.setItem('routineState', JSON.stringify(this.routineState));
    } catch (error) {
      console.error('Failed to save routine state locally:', error);
    }
  }

  async loadFromLocalStorage() {
    try {
      const saved = await AsyncStorage.getItem('routineState');
      if (saved) {
        const state = JSON.parse(saved);
        this.routineState = {
          ...state,
          lastUpdated: new Date(state.lastUpdated),
        };
        
        // Check if it's a new day
        const today = new Date().toDateString();
        const lastUpdated = new Date(this.routineState.lastUpdated).toDateString();
        
        if (today !== lastUpdated) {
          this.routineState = {
            routine1: false,
            routine2: false,
            routine3: false,
            routine4: false,
            routine5: false,
            lastUpdated: new Date(),
          };
        }
        
        await this.updateWidget();
      }
    } catch (error) {
      console.error('Failed to load routine state:', error);
    }
  }
}

export const widgetService = new WidgetService();