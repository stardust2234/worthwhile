<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    label: string;
    value: number | string;
    suffix: string;
    min?: number;
    max?: number;
    step?: number | string;
    readonly?: boolean;
  }>(),
  {
    min: 0,
    max: 1_000_000_000,
    step: undefined,
    readonly: false,
  },
);
const emit = defineEmits<{ (event: "update:value", value: number): void }>();
</script>

<template>
  <label :for="id">
    {{ label }}
    <input
      :id="id"
      :value="value"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :readonly="readonly"
      @input="
        emit('update:value', Number(($event.target as HTMLInputElement).value))
      "
    />
    <span class="numeric-field-suffix">{{ suffix }}</span>
  </label>
</template>
