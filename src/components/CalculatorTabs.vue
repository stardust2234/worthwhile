<script setup lang="ts">
import { nextTick } from "vue";
import { CheckCircle2, HandCoins, Home, ShieldCheck } from "lucide-vue-next";

const tabs = [
  { value: "purchase", label: "Big purchase", icon: HandCoins },
  { value: "move", label: "Moving home", icon: Home },
  { value: "safety", label: "Safety net", icon: ShieldCheck },
  { value: "results", label: "Results", icon: CheckCircle2 },
] as const;
type TabValue = (typeof tabs)[number]["value"];

defineProps<{ modelValue: TabValue }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: TabValue): void;
}>();

const selectTab = (tab: TabValue) => {
  emit("update:modelValue", tab);
  void nextTick(() =>
    document.querySelector<HTMLElement>(`[data-tab="${tab}"]`)?.focus(),
  );
};

const selectRelativeTab = (current: TabValue, offset: number) => {
  const currentIndex = tabs.findIndex((tab) => tab.value === current);
  selectTab(tabs[(currentIndex + offset + tabs.length) % tabs.length].value);
};
</script>

<template>
  <div class="tabs" role="tablist" aria-label="Financial calculators">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :id="`calculator-tab-${tab.value}`"
      :data-tab="tab.value"
      aria-controls="calculator-panel"
      :class="{ selected: modelValue === tab.value }"
      :aria-selected="modelValue === tab.value"
      :tabindex="modelValue === tab.value ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab(tab.value, -1)"
      @keydown.right.prevent="selectRelativeTab(tab.value, 1)"
      @keydown.home.prevent="selectTab(tabs[0].value)"
      @keydown.end.prevent="selectTab(tabs[tabs.length - 1].value)"
      @click="selectTab(tab.value)"
    >
      <component :is="tab.icon" :size="16" /> {{ tab.label }}
    </button>
  </div>
</template>
