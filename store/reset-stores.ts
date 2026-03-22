import { useEquationsStore } from './equations-store';
import { useMathStore } from './math-store';
import { useSettingsStore } from './settings-store';

export function resetAllStores() {
  useSettingsStore.getState().reset();
  useMathStore.getState().reset();
  useEquationsStore.getState().reset();
}
