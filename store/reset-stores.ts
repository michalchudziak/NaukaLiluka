import { useSettingsStore } from './settings-store';

export function resetAllStores() {
  useSettingsStore.getState().reset();
}
