<script setup lang="ts">
import { ref, toRef } from "vue";
import { X } from "lucide-vue-next";
import { useDialogAccessibility } from "../composables/useDialogAccessibility";

const props = withDefaults(
  defineProps<{
    open: boolean;
    closeLabel: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    panelClass?: string;
  }>(),
  {
    ariaLabel: undefined,
    ariaLabelledby: undefined,
    panelClass: undefined,
  },
);
const emit = defineEmits<{ (event: "close"): void }>();
const dialog = ref<HTMLElement | null>(null);

useDialogAccessibility(toRef(props, "open"), dialog, () => emit("close"));
</script>

<template>
  <div v-if="open" class="dialog-overlay" @click.self="emit('close')">
    <section
      ref="dialog"
      :class="['dialog-panel', panelClass]"
      role="dialog"
      aria-modal="true"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      tabindex="-1"
    >
      <button
        class="dialog-close"
        type="button"
        :aria-label="closeLabel"
        @click="emit('close')"
      >
        <X :size="20" />
      </button>
      <slot />
    </section>
  </div>
</template>
