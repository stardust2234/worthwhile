<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

const props = defineProps<{ preferencesOpen: boolean }>();
const emit = defineEmits<{
  (event: "open-preferences"): void;
  (event: "show-notice", message: string): void;
  (event: "clear-saved-data"): void;
}>();
const preferencesButton = ref<HTMLElement | null>(null);

watch(
  () => props.preferencesOpen,
  (open, wasOpen) => {
    if (!open && wasOpen) {
      void nextTick(() => preferencesButton.value?.focus());
    }
  },
);
</script>

<template>
  <div class="top-bar">
    <div class="app-brand">
      <span><img src="/favicon-32.png" alt="" /></span>worthwhile
    </div>
    <nav class="top-nav" aria-label="Utility navigation">
      <button
        ref="preferencesButton"
        class="nav-preferences"
        type="button"
        @click="emit('open-preferences')"
      >
        Preferences
      </button>
      <button
        type="button"
        @click="
          emit(
            'show-notice',
            'Enter your numbers in any calculator, then review Results.',
          )
        "
      >
        How it works
      </button>
      <button type="button" @click="emit('clear-saved-data')">
        Clear saved data
      </button>
    </nav>
  </div>
</template>
