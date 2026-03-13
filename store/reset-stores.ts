import { useBookStore } from './book-store';
import { useDrawingsStore } from './drawings-store';
import { useEquationsStore } from './equations-store';
import { useMathStore } from './math-store';
import { useNoRepStore } from './no-rep-store';
import { useSettingsStore } from './settings-store';

export function resetAllStores() {
  useSettingsStore.getState().reset();
  useNoRepStore.getState().reset();
  useBookStore.getState().reset();
  useDrawingsStore.getState().reset();
  useMathStore.getState().reset();
  useEquationsStore.getState().reset();
}
