import { ref } from "vue";

export function usePreferences(notify: (message: string) => void) {
  const preferencesOpen = ref(false);

  const openPreferences = () => {
    preferencesOpen.value = true;
  };
  const closePreferences = () => {
    preferencesOpen.value = false;
  };
  const savePreferences = () => {
    closePreferences();
    notify("Preferences saved on this device.");
  };

  return {
    preferencesOpen,
    openPreferences,
    closePreferences,
    savePreferences,
  };
}
