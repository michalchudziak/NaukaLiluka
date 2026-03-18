import { useBookStore } from './book-store';
import { useDrawingsStore } from './drawings-store';
import { useEquationsStore } from './equations-store';
import { useMathStore } from './math-store';
import { useSettingsStore } from './settings-store';

export function resetAllStores() {
  useSettingsStore.getState().reset();
  useBookStore.getState().reset();
  useDrawingsStore.getState().reset();
  useMathStore.getState().reset();
  useEquationsStore.getState().reset();
}
